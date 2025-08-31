import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";

const bankLogos = import.meta.glob("../assets/banks/*.svg", {
  eager: true,
  as: "url",
}) as Record<string, string>;

const logo = (id: string) => bankLogos[`../assets/banks/${id}.svg`];

type Session = {
  sessionId: string;
  amountCents: number;
  currency: string;
  orderId?: string;
  status: "pending" | "succeeded" | "cancelled" | "failed";
  merchant?: string;
  expiresAt?: string;
};

type CheckoutInfo = {
  email?: string;
  delivery?: boolean;
  address?: string;
} | null;

const LT_BANKS = [
  { id: "swedbank", label: "Swedbank" },
  { id: "seb", label: "SEB" },
  { id: "luminor", label: "Luminor" },
  { id: "siauliu", label: "Šiaulių bankas" },
  { id: "citadele", label: "Citadele" },
];

const INTERNATIONAL = [
  { id: "paypal", label: "PayPal" },
  { id: "revolut", label: "Revolut" },
];

export default function MockBank() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const sid = new URLSearchParams(search).get("sid") || "";
  const backend = (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:4000";

  const { cartItems } = useCart();

  const [session, setSession] = useState<Session | null>(null);
  const [secsLeft, setSecsLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutInfo: CheckoutInfo = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("checkoutInfo");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const locale = i18n.language === "lt" ? "lt-LT" : "en-US";
  const currency = (session?.currency || "EUR") as Intl.NumberFormatOptions["currency"];

  const cartTotal = useMemo(() => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
  }, [cartItems]);

  const displayTotal = useMemo(() => {
    const cents = typeof session?.amountCents === "number" ? session.amountCents : Math.round(cartTotal * 100);
    return new Intl.NumberFormat(locale, { style: "currency", currency: (currency || "EUR") as any }).format(cents / 100);
  }, [session?.amountCents, cartTotal, locale, currency]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${backend}/api/payments/mock/session/${sid}`, { credentials: "include" });
        if (!res.ok) throw new Error("Invalid session");
        const s: Session = await res.json();
        if (cancelled) return;
        setSession(s);

        if (s.expiresAt) {
          const end = new Date(s.expiresAt).getTime();
          const tick = () => setSecsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
          tick();
          const id = setInterval(tick, 1000);
          return () => clearInterval(id);
        }
      } catch (e) {
        setError((e as Error)?.message || "Failed to load session");
        navigate("/checkout", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (sid) load();
    return () => { cancelled = true; };
  }, [sid, backend, navigate]);

  const expired = secsLeft !== null && secsLeft <= 0;

  async function decide(result: "success" | "cancel", method?: string) {
    if (!session || deciding) return;
    setDeciding(true);
    setError(null);
    try {
      const res = await fetch(`${backend}/api/payments/mock/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: session.sessionId, result, method }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to finalize payment");
      }
      const { redirectUrl } = await res.json();
      sessionStorage.removeItem("checkoutInfo");
      window.location.assign(redirectUrl);
    } catch (e) {
      setError((e as Error)?.message || "Failed to finalize payment");
      setDeciding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl pt-28 p-6">
        <div className="animate-pulse h-24 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl mt-24 p-4 md:p-6">
      <div className="rounded-2xl shadow-lg border bg-white">
        <div className="grid gap-6 md:grid-cols-3 p-4 md:p-6">
          <section className="md:col-span-2">
            <header className="mb-4 flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {i18n.language === "lt" ? "Apmokėjimas" : "Banking Checkout"}
                </h1>
                {session?.merchant && <p className="text-sm opacity-70">{session.merchant}</p>}
              </div>
              {secsLeft !== null && (
                <p className="text-sm opacity-70">
                  {i18n.language === "lt"
                    ? `Sesija baigsis po ${Math.floor(secsLeft / 60)}:${String(secsLeft % 60).padStart(2, "0")}`
                    : `Session expires in ${Math.floor(secsLeft / 60)}:${String(secsLeft % 60).padStart(2, "0")}`}
                </p>
              )}
            </header>

            <div className="space-y-6">
              {/* Cart */}
              <div>
                <h2 className="font-medium mb-3">
                  {i18n.language === "lt" ? "Jūsų krepšelis" : "Your Cart"}
                </h2>
                <div className="divide-y rounded-xl border">
                  {(cartItems?.length ? cartItems : []).map((it) => (
                    <div key={it._id} className="p-3 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium">
                          {typeof it.name === "object"
                            ? (i18n.language === "lt" ? it.name.lt : it.name.en) || it.manufacturingID
                            : (it as any).name}
                        </div>
                        <div className="text-sm opacity-70">
                          {i18n.language === "lt" ? "Kiekis" : "Qty"}: {it.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {new Intl.NumberFormat(locale, { style: "currency", currency: (currency || "EUR") as any })
                            .format((it.price || 0) * (it.quantity || 0))}
                        </div>
                        <div className="text-sm opacity-70">
                          {new Intl.NumberFormat(locale, { style: "currency", currency: (currency || "EUR") as any })
                            .format(it.price || 0)}{" "}
                          / {i18n.language === "lt" ? "vnt." : "unit"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!cartItems?.length && (
                    <div className="p-4 text-sm opacity-70">
                      {i18n.language === "lt"
                        ? "Krepšelis nerastas — parodyta bendra suma iš mokėjimo sesijos."
                        : "Cart not available — showing total from payment session."}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <div className="text-sm opacity-70 mb-1">
                    {i18n.language === "lt" ? "El. paštas" : "Email"}
                  </div>
                  <div className="font-medium">{checkoutInfo?.email || "—"}</div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="text-sm opacity-70 mb-1">
                    {i18n.language === "lt" ? "Pristatymas" : "Delivery"}
                  </div>
                  <div className="font-medium">
                    {checkoutInfo?.delivery ? (i18n.language === "lt" ? "Taip" : "Yes") : (i18n.language === "lt" ? "Ne" : "No")}
                  </div>
                </div>

                {checkoutInfo?.delivery && (
                  <div className="sm:col-span-2 rounded-xl border p-3">
                    <div className="text-sm opacity-70 mb-1">
                      {i18n.language === "lt" ? "Pristatymo adresas" : "Delivery address"}
                    </div>
                    <div className="font-medium whitespace-pre-line">
                      {checkoutInfo?.address || "—"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT — 1/3 */}
          <aside className="space-y-6">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{i18n.language === "lt" ? "Suma" : "Total"}</span>
                <span className="text-xl font-semibold">{displayTotal}</span>
              </div>
            </div>

            {/* Lithuanian banks */}
            <div>
              <div className="mb-2 text-sm font-medium opacity-80">
                {i18n.language === "lt" ? "Bankai Lietuvoje" : "Lithuanian Banks"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LT_BANKS.map(({ id, label }) => {
                  const src = logo(id);
                  return (
                    <button
                      key={id}
                      disabled={deciding || expired}
                      onClick={() => decide("success", id)}
                      className={`group rounded-xl border px-3 py-3 flex items-center justify-center transition
                                  hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10
                                  active:scale-[0.99] ${(deciding || expired) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {src ? (
                        <img src={src} alt={label} className="h-6 w-auto" />
                      ) : (
                        <span className="font-medium">{label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* International */}
            <div>
              <div className="mb-2 text-sm font-medium opacity-80">
                {i18n.language === "lt" ? "Tarptautiniai" : "International"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERNATIONAL.map(({ id, label }) => {
                  const src = logo(id);
                  return (
                    <button
                      key={id}
                      disabled={deciding || expired}
                      onClick={() => decide("success", id)}
                      className={`group rounded-xl border px-3 py-3 text-left font-medium transition
                                  hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10
                                  active:scale-[0.99] ${(deciding || expired) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="flex items-center gap-3">
                        {src ? (
                          <img src={src} alt="" className="h-5 w-auto" />
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[10px]">
                            {label.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="truncate">{label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cancel only */}
            <div className="pt-2">
              <button
                onClick={() => decide("cancel")}
                disabled={deciding}
                className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 active:scale-[0.99]"
              >
                {i18n.language === "lt" ? "Atšaukti" : "Cancel"}
              </button>
            </div>

            {expired && (
              <p className="text-sm text-red-600">
                {i18n.language === "lt"
                  ? "Sesijos laikas baigėsi. Pasirinkite „Atšaukti“ ir bandykite dar kartą."
                  : "Session expired. Choose Cancel and try again."}
              </p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </aside>
        </div>
      </div>
    </div>
  );
}
