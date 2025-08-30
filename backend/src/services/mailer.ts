import nodemailer from "nodemailer";

const transportKind = process.env.EMAIL_TRANSPORT || "smtp";
const FROM = process.env.EMAIL_FROM || "No-Reply <no-reply@example.com>";

type SendOpts = {
  to: string | string[];
  subject: string;
  html: string;
  bcc?: string | string[];
  replyTo?: string;
};

function toPort(v: string | undefined, fallback: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function makeTransport() {
  if (transportKind === "console") {
    return {
      sendMail: async (opts: SendOpts) => {
        console.log("=== DEV EMAIL ===");
        console.log("From:", FROM);
        console.log("To:", opts.to);
        if (opts.bcc) console.log("BCC:", opts.bcc);
        if (opts.replyTo) console.log("Reply-To:", opts.replyTo);
        console.log("Subject:", opts.subject);
        console.log("HTML:\n", opts.html);
        console.log("=================");
        return { messageId: "dev" };
      },
    } as any;
  }

  const port = toPort(process.env.SMTP_PORT, 1025);
  const host = process.env.SMTP_HOST || "localhost";

  console.log(`[mailer] creating transporter host=${host} port=${port}`);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

const mailer = makeTransport();

export async function sendMail(opts: SendOpts) {
  return mailer.sendMail({
    from: FROM,
    to: opts.to,
    bcc: opts.bcc,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });
}
