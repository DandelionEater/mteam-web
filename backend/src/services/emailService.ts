import { sendMail } from "./mailer";
import { orderConfirmationEmail, orderStatusEmail } from "./emailTemplates";
import type { Order } from "../model/Order.schema";

// simple in-memory rate limiter per recipient (dev-safe)
const windowMs = Number(process.env.EMAIL_RATE_WINDOW_MS || 60000);
const maxPerWindow = Number(process.env.EMAIL_RATE_MAX || 8);
const buckets = new Map<string, number[]>();
function canSend(to: string): boolean {
  const now = Date.now();
  const arr = buckets.get(to) || [];
  const recent = arr.filter(ts => now - ts < windowMs);
  if (recent.length >= maxPerWindow) return false;
  recent.push(now);
  buckets.set(to, recent);
  return true;
}

const COMPANY_EMAIL = process.env.COMPANY_ORDER_EMAIL || "";

export async function sendOrderCreatedEmails(order: Order) {
  const locale: "en" | "lt" = (order as any).locale === "lt" ? "lt" : "en";
  const { subject, html } = orderConfirmationEmail(order, locale);
  const toUser = order.enteredEmail;
  try {
    if (!canSend(toUser)) throw new Error("Rate limited");
    await sendMail({ to: toUser, bcc: COMPANY_EMAIL || undefined, subject, html });
  } catch (err) {
    console.error("Order confirmation email failed:", err);
  }
}

export async function sendOrderStatusEmails(order: Order) {
  const locale: "en" | "lt" = (order as any).locale === "lt" ? "lt" : "en";
  const { subject, html } = orderStatusEmail(order, locale);
  const toUser = order.enteredEmail;
  try {
    if (!canSend(toUser)) throw new Error("Rate limited");
    await sendMail({ to: toUser, bcc: COMPANY_EMAIL || undefined, subject, html });
  } catch (err) {
    console.error("Order status email failed:", err);
  }
}
