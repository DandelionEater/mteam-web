import { Router, Request, Response } from "express";
import crypto from "crypto";
import querystring from "querystring";

function base64urlEncode(str: string) {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-");
}

function base64urlDecodeToString(b64url: string) {
  const b64 = b64url.replace(/_/g, "/").replace(/-/g, "+");
  return Buffer.from(b64, "base64").toString("utf8");
}

function makeDataAndSign(params: Record<string, string | number | boolean>) {
  const urlEncoded = querystring.stringify(params);
  const data = base64urlEncode(urlEncoded);
  const sign = crypto
    .createHash("md5")
    .update(data + (process.env.PAYSERA_SIGN_PASSWORD || ""))
    .digest("hex");
  return { data, sign };
}

const router = Router();

router.post("/start", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amountCents, currency, lang } = req.body;

    if (!orderId || !amountCents) {
      res.status(400).json({ message: "orderId and amountCents are required" });
      return;
    }

    const params = {
      projectid: process.env.PAYSERA_PROJECT_ID || "",
      orderid: String(orderId),
      amount: String(amountCents),
      currency: (currency || "EUR").toUpperCase(),
      accepturl: `${process.env.PUBLIC_BASE_URL}/checkout/success`,
      cancelurl: `${process.env.PUBLIC_BASE_URL}/checkout/cancel`,
      callbackurl: `${process.env.BACKEND_BASE_URL}/api/payments/paysera/callback`,
      test: process.env.PAYSERA_TEST === "1" ? 1 : 0,
      lang: lang || "ENG",
    };

    const { data, sign } = makeDataAndSign(params);
    const url = `https://www.paysera.com/pay/?data=${encodeURIComponent(data)}&sign=${sign}`;
    res.json({ url });
  } catch (e: any) {
    console.error("paysera/start error", e);
    res.status(500).json({ message: "Failed to start Paysera checkout" });
  }
});

router.post("/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, ss1 } = req.body;

    if (!data || !ss1) {
      res.status(400).send("Missing data/ss1");
      return;
    }

    const expected = crypto
      .createHash("md5")
      .update(data + (process.env.PAYSERA_SIGN_PASSWORD || ""))
      .digest("hex");

    if (ss1 !== expected) {
      res.status(400).send("Invalid ss1");
      return;
    }

    const decoded = base64urlDecodeToString(data);
    const params = querystring.parse(decoded);

    console.log("Paysera callback OK:", params);

    // TODO: mark order as paid in DB
    res.send("OK");
  } catch (e: any) {
    console.error("paysera/callback error", e);
    res.status(500).send("ERR");
  }
});

export default router;
