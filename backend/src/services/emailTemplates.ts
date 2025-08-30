import type { Order } from "../model/Order.schema";

const BRAND_LOGO = `${process.env.BACKEND_BASE_URL || "http://localhost:4000"}/email-assets/logo_light.png`;
const styles = `
  body{font-family:Arial,Helvetica,sans-serif;color:#111}
  .wrap{max-width:640px;margin:0 auto;padding:16px}
  .card{border:1px solid #eee;border-radius:10px;padding:16px}
  .muted{color:#666}
  .items td,.items th{border-bottom:1px solid #f1f1f1;padding:6px 4px}
  .footer{color:#777;font-size:12px;margin-top:16px}
  .pill{display:inline-block;background:#f4f4f4;border:1px solid #ddd;padding:2px 8px;border-radius:999px}
`;

const currency = (n: number, locale: "en" | "lt") =>
  new Intl.NumberFormat(locale === "lt" ? "lt-LT" : "en-US", {
    style: "currency",
    currency: locale === "lt" ? "EUR" : "USD",
  }).format(n);

const statusLabel = (status: Order["status"], locale: "en" | "lt") => {
  const map = {
    en: { created: "Created", packing: "Packing", sent: "Sent", completed: "Completed" },
    lt: { created: "Sukurta", packing: "Pakuojama", sent: "Išsiųsta", completed: "Užbaigta" },
  } as const;
  const lang = locale === "lt" ? "lt" : "en";
  return (map as any)[lang][status] || status;
};

const itemsTable = (order: Order) => `
  <table class="items" width="100%" cellpadding="0" cellspacing="0">
    <thead><tr><th align="left">Manufacturing ID</th><th align="left">Qty</th></tr></thead>
    <tbody>
      ${order.items.map(it => `<tr><td>${it.manufacturingID}</td><td>${it.quantity}</td></tr>`).join("")}
    </tbody>
  </table>
`;

export function orderConfirmationEmail(order: Order, locale: "en" | "lt") {
  const lt = locale === "lt";
  const subject = lt
    ? `Užsakymas ${order.orderNumber} gautas`
    : `Order ${order.orderNumber} received`;
  const html = `
  <html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <p><img src="${BRAND_LOGO}" alt="Logo" height="40" /></p>
      <div class="card">
        <h2>${lt ? "Ačiū už užsakymą!" : "Thanks for your order!"}</h2>
        <p>${lt ? "Užsakymo numeris" : "Order number"}: <strong>${order.orderNumber}</strong></p>
        <p>${lt ? "El. paštas" : "Email"}: ${order.enteredEmail}</p>
        ${order.delivery ? `<p>${lt ? "Pristatymo adresas" : "Delivery address"}: ${order.address || "-"}</p>` : ""}
        <p><span class="pill">${lt ? "Būsena" : "Status"}: ${statusLabel(order.status, locale)}</span></p>
        <h3>${lt ? "Prekės" : "Items"}</h3>
        ${itemsTable(order)}
        <p><strong>${lt ? "Suma" : "Total"}:</strong> ${currency(order.total, locale)}</p>
      </div>
      <p class="footer">${lt ? "Šis laiškas yra transakcinis." : "This email is transactional."}</p>
    </div>
  </body></html>`;
  return { subject, html };
}

export function orderStatusEmail(order: Order, locale: "en" | "lt") {
  const lt = locale === "lt";
  const subject = lt
    ? `Užsakymo ${order.orderNumber} būsena: ${statusLabel(order.status, locale)}`
    : `Order ${order.orderNumber} status: ${statusLabel(order.status, locale)}`;
  const html = `
  <html><head><style>${styles}</style></head><body>
    <div class="wrap">
      <p><img src="${BRAND_LOGO}" alt="Logo" height="40" /></p>
      <div class="card">
        <h2>${lt ? "Atnaujinta užsakymo būsena" : "Order status updated"}</h2>
        <p>${lt ? "Užsakymo numeris" : "Order number"}: <strong>${order.orderNumber}</strong></p>
        <p>${lt ? "Nauja būsena" : "New status"}: <strong>${statusLabel(order.status, locale)}</strong></p>
      </div>
      <p class="footer">${lt ? "Šis laiškas yra transakcinis." : "This email is transactional."}</p>
    </div>
  </body></html>`;
  return { subject, html };
}
