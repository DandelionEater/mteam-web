import { Router, Request, Response } from "express";
import crypto from "crypto";
import { PaymentSessionModel, PaymentStatus } from "../../model/PaymentSession.schema";
import { OrderModel, OrderStatus } from "../../model/Order.schema";
import { sendOrderCreatedEmails, sendOrderStatusEmails } from "../../services/emailService";

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

/** Finalize the mock payment and redirect to success/cancel */
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

    if (new Date(session.expiresAt ?? 0).getTime() < Date.now()) {
      session.status = PaymentStatus.Failed;
      await session.save();
      res.status(400).json({ message: "Session expired" });
      return;
    }

    let redirectUrl = session.cancelUrl || (process.env.FRONTEND_ORIGIN || "http://localhost:5173") + "/checkout/cancel";

    if (result === "success") {
      session.status = PaymentStatus.Succeeded;
      await session.save();

      // Mark order "paid" by moving it into Packing (you already use this status)
      const updated = await OrderModel.findByIdAndUpdate(
        session.orderId,
        { status: OrderStatus.Created },
        { new: true }
      ).lean();

      if (updated) {
        // Send status email (your current email system)
        sendOrderCreatedEmails(updated as any).catch(() => {});
      }

      redirectUrl = session.successUrl || (process.env.FRONTEND_ORIGIN || "http://localhost:5173") + "/checkout/success";
    } else if (result === "cancel") {
      session.status = PaymentStatus.Cancelled;
      await session.save();

      // also update the order itself
      await OrderModel.findByIdAndUpdate(
        session.orderId,
        { status: OrderStatus.Cancelled }
      );

      redirectUrl = session.cancelUrl || redirectUrl;
    } else {
      session.status = PaymentStatus.Failed;
      await session.save();

      // also update the order itself
      await OrderModel.findByIdAndUpdate(
        session.orderId,
        { status: OrderStatus.Cancelled }
      );
    }

    res.json({ redirectUrl });
  } catch (err) {
    console.error("mock/decide error", err);
    res.status(500).json({ message: "Failed to decide payment" });
  }
});

export default router;
