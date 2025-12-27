import { Router, Request, Response } from "express";
import crypto from "crypto";
import { PaymentSessionModel, PaymentStatus } from "../../model/PaymentSession.schema";
import { OrderModel, OrderStatus } from "../../model/Order.schema";
import { sendOrderCreatedEmails, sendOrderStatusEmails } from "../../services/emailService";
import { ItemModel } from "../../model/Item.schema";

const router = Router();

/** Create a mock-payment session and return a redirect URL to the fake bank page */
router.post("/start", async (req: Request, res: Response) => {
  try {
    const { orderId, amountCents, currency, successUrl, cancelUrl } = req.body as {
      orderId?: string;
      amountCents?: number;
      currency?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!orderId || !amountCents || !currency) {
      res.status(400).json({ message: "orderId, amountCents and currency are required" });
      return;
    }

    const order = await OrderModel.findById(orderId).lean();
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const expected = Math.round((order.total as number) * 100);
    if (Math.abs(expected - amountCents) > 1) {
      res.status(400).json({ message: `Amount mismatch: expected ${expected}, got ${amountCents}` });
      return;
    }

    const sessionId = crypto.randomBytes(12).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await PaymentSessionModel.create({
      sessionId,
      orderId,
      amountCents,
      currency,
      status: PaymentStatus.Pending,
      successUrl,
      cancelUrl,
      expiresAt,
    });

    const frontend = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    res.json({ url: `${frontend}/mock-bank?sid=${sessionId}`, sessionId });
  } catch (err) {
    console.error("mock/start error", err);
    res.status(500).json({ message: "Failed to create payment session" });
  }
});

/** Public session details (for the fake bank UI) */
router.get("/session/:id", async (req: Request, res: Response) => {
  try {
    const s = await PaymentSessionModel.findOne({ sessionId: req.params.id }).lean();
    if (!s) {
      res.status(404).json({ message: "Session not found" });
      return;
    }
    res.json({
      sessionId: s.sessionId,
      amountCents: s.amountCents,
      currency: s.currency,
      orderId: s.orderId,
      status: s.status,
      expiresAt: s.expiresAt,
      merchant: process.env.MERCHANT_NAME || "MTEAM Shop",
    });
  } catch (err) {
    console.error("mock/session error", err);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

router.post("/decide", async (req: Request, res: Response) => {
  try {
    const { sessionId, result } = req.body as { sessionId?: string; result?: string };
    if (!sessionId || !result) {
      res.status(400).json({ message: "sessionId and result are required" });
      return;
    }

    const session = await PaymentSessionModel.findOne({ sessionId });
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const frontend = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    let redirectUrl = session.cancelUrl || `${frontend}/checkout/cancel`;

    if (new Date(session.expiresAt ?? 0).getTime() < Date.now()) {
      session.status = PaymentStatus.Failed;
      await session.save();

      await OrderModel.findByIdAndUpdate(session.orderId, { status: OrderStatus.Cancelled });
      res.status(400).json({ message: "Session expired" });
      return;
    }

    if (result === "success") {
      const dbSession = await ItemModel.db.startSession();

      try {
        let updatedOrder: any = null;

        await dbSession.withTransaction(async () => {
          const order = await OrderModel.findById(session.orderId).session(dbSession);
          if (!order) {
            res.status(404).json({ message: "Order not found" });
            throw new Error("RESPONDED");
          }

          if (order.status !== OrderStatus.PendingPayment) {
            updatedOrder = order;
            return;
          }

          for (const line of order.items as Array<{ manufacturingID: string; quantity: number }>) {
            const qty = Number(line.quantity);

            const r = await ItemModel.updateOne(
              { manufacturingID: line.manufacturingID, stock: { $gte: qty } },
              { $inc: { stock: -qty } },
              { session: dbSession }
            );

            if (r.modifiedCount !== 1) {
              res.status(409).json({
                message: `Not enough stock for ${line.manufacturingID}`,
                manufacturingID: line.manufacturingID,
              });
              throw new Error("NOT_ENOUGH_STOCK");
            }
          }

          session.status = PaymentStatus.Succeeded;
          await session.save({ session: dbSession } as any);

          order.status = OrderStatus.Created;
          updatedOrder = await order.save({ session: dbSession });
        });

        if (!res.headersSent) {
          if (updatedOrder) {
            sendOrderCreatedEmails(updatedOrder as any).catch(() => {});
          }

          redirectUrl = session.successUrl || `${frontend}/checkout/success`;
          res.json({ redirectUrl });
        }
        return;
      } catch (e: any) {
        if (e?.message === "NOT_ENOUGH_STOCK") return;
        if (e?.message === "RESPONDED") return;
        console.error("mock/decide stock error", e);
        if (!res.headersSent) res.status(500).json({ message: "Failed to confirm payment" });
        return;
      } finally {
        dbSession.endSession();
      }
    }

    if (result === "cancel") {
      session.status = PaymentStatus.Cancelled;
      await session.save();

      await OrderModel.findByIdAndUpdate(session.orderId, { status: OrderStatus.Cancelled });

      redirectUrl = session.cancelUrl || redirectUrl;
      res.json({ redirectUrl });
      return;
    }

    session.status = PaymentStatus.Failed;
    await session.save();

    await OrderModel.findByIdAndUpdate(session.orderId, { status: OrderStatus.Cancelled });

    res.json({ redirectUrl });
  } catch (err) {
    console.error("mock/decide error", err);
    res.status(500).json({ message: "Failed to decide payment" });
  }
});

export default router;
