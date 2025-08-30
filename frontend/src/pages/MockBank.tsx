import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Session = {
  sessionId: string;
  amountCents: number;
  currency: string;
  status: "pending" | "succeeded" | "cancelled" | "failed";
  merchant: string;
  expiresAt?: string;
};

export default function MockBank() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const sid = params.get("sid") || "";
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backend = (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backend}/api/payments/mock/session/${sid}`, { credentials: "include" });
        if (!res.ok) throw new Error("Invalid session");
        const data = await res.json();
        setSession(data);
      } catch (e: any) {
        setError(e.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    if (sid) run();
  }, [sid]);

  const amountFormatted = useMemo(() => {
    if (!session) return "";
    const lang = i18n.language === "lt" ? "lt-LT" : "en-US";
    return new Intl.NumberFormat(lang, { style: "currency", currency: session.currency }).format(session.amountCents / 100);
  }, [session, i18n.language]);

  const decide = async (result: "success" | "cancel") => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${backend}/api/payments/mock/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: sid, result }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to complete payment");
      }
      const { redirectUrl } = await res.json();
      window.location.href = redirectUrl;
    } catch (e: any) {
      setError(e.message || "Failed to complete payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 mt-20 border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center">🔒</div>
            <h1 className="text-xl font-semibold">{t("mockbank.title") || "Online banking"}</h1>
          </div>
          <div className="text-xs text-gray-500">{t("mockbank.secure") || "This is a secure simulation for demo purposes."}</div>
        </div>

        {loading ? (
          <p>{t("common.loading") || "Loading..."}</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !session ? (
          <p className="text-red-600">Invalid session</p>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-4 border mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("mockbank.merchant") || "Merchant"}</span>
                <span className="font-medium">{session.merchant}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">{t("mockbank.amount") || "Amount"}</span>
                <span className="font-semibold">{amountFormatted}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4">
              <label className="text-sm">
                {t("mockbank.username") || "Username"}
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>

              <label className="text-sm">
                {t("mockbank.password") || "Password"}
                <input
                  type="password"
                  className="mt-1 w-full border rounded px-3 py-2"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="text-sm">
                {t("mockbank.otp") || "One-time code"}
                <input
                  className="mt-1 w-full border rounded px-3 py-2 tracking-widest"
                  placeholder="●●●●●●"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => decide("cancel")}
                disabled={submitting}
                className="px-4 py-2 rounded-md border"
              >
                {t("mockbank.cancel") || "Cancel"}
              </button>
              <button
                onClick={() => decide("success")}
                disabled={submitting || !username || !password || !otp}
                className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-60"
              >
                {submitting ? (t("common.loading") || "Loading...") : (t("mockbank.confirm") || "Confirm payment")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
