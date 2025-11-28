import { useEffect, useMemo, useState, FormEvent} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { createOrder } from "../dbMiddleware/OrderCRUD";
import { useToast } from "../components/ToastContext";

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

type CheckoutAddress = {
  street: string;
  houseNumber: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
};

type CheckoutInfo = {
  email?: string;
  delivery?: boolean;
  address?: CheckoutAddress;
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const sid = new URLSearchParams(search).get("sid") || "";
  const backend = (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:4000";
  const { cartItems } = useCart();
  const { showToast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [secsLeft, setSecsLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(!!sid);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>(() => {
    try {
      const raw = sessionStorage.getItem("checkoutInfo");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState(checkoutInfo?.email || "");
  const [delivery, setDelivery] = useState<boolean>(!!checkoutInfo?.delivery);
  const [street, setStreet] = useState(checkoutInfo?.address?.street || "");
  const [houseNumber, setHouseNumber] = useState(checkoutInfo?.address?.houseNumber || "");
  const [apartment, setApartment] = useState(checkoutInfo?.address?.apartment || "");
  const [city, setCity] = useState(checkoutInfo?.address?.city || "");
  const [postalCode, setPostalCode] = useState(checkoutInfo?.address?.postalCode || "");
  const [country, setCountry] = useState(checkoutInfo?.address?.country || "");
  const [creating, setCreating] = useState(false);

  const [step, setStep] = useState<"details" | "payment">("details");

  useEffect(() => {
    if (sid) setStep("payment");
  }, [sid]);

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
        const res = await fetch(`${backend}/api/payments/mock/session/${sid}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Invalid session");
        const s: Session = await res.json();
        if (cancelled) return;
        setSession(s);

        if (s.expiresAt) {
          const end = new Date(s.expiresAt).getTime();
          const tick = () => {
            const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
            setSecsLeft(seconds);
          };
          tick();
          const id = setInterval(tick, 1000);
          return () => clearInterval(id);
        }
      } catch (e) {
        setError((e as Error)?.message || "Failed to load session");
        navigate("/cart", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (sid) {
      load();
    } else {
      setLoading(false);
      setSession(null);
      setSecsLeft(null);
    }

    return () => {
      cancelled = true;
    };
  }, [sid, backend, navigate]);

  useEffect(() => {
    if (sid && step === "details") {
      setStep("payment");
    }
  }, [sid, step]);

  const expired = secsLeft !== null && secsLeft <= 0;

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (creating) return;

    if (!email.trim()) {
      showToast({
        type: "error",
        message: t("checkout.emailRequired") || "Email is required",
      });
      return;
    }

    if (!cartItems?.length) {
      showToast({
        type: "error",
        message: t("checkout.noItems") || "Your cart is empty",
      });
      return;
    }

    let addressPayload: CheckoutAddress | undefined = undefined;

    if (delivery) {
      if (
        !street.trim() ||
        !houseNumber.trim() ||
        !city.trim() ||
        !postalCode.trim() ||
        !country.trim()
      ) {
        showToast({
          type: "error",
          message:
            t("checkout.addressRequiredFull") ||
            t("checkout.addressRequired") ||
            "Full address is required for delivery",
        });
        return;
      }

      addressPayload = {
        street: street.trim(),
        houseNumber: houseNumber.trim(),
        apartment: apartment.trim() || undefined,
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      };
    }

    try {
      setCreating(true);

      const orderItems = cartItems.map((ci) => ({
        manufacturingID: ci.manufacturingID,
        quantity: ci.quantity,
      }));

      const created = await createOrder({
        email,
        delivery,
        address: addressPayload,
        items: orderItems,
        locale: i18n.language === "lt" ? "lt" : "en",
      });

      const info: CheckoutInfo = {
        email,
        delivery,
        address: addressPayload,
      };
      sessionStorage.setItem("checkoutInfo", JSON.stringify(info));
      setCheckoutInfo(info);

      const origin = window.location.origin;
      const res = await fetch(`${backend}/api/payments/mock/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: created._id,
          amountCents: Math.round(created.total * 100),
          currency: "EUR",
          successUrl: `${origin}/checkout/success`,
          cancelUrl: `${origin}/checkout/cancel`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to start payment session");
      }

      const { sessionId } = await res.json();
      setStep("payment");
      navigate(`/mock-bank?sid=${sessionId}`, { replace: true });
    } catch (err: any) {
      console.error(err);
      showToast({
        type: "error",
        message:
          err?.message ||
          (t("checkout.fail") as string) ||
          "Failed to create order or start payment",
      });
      setCreating(false);
    }
  };

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
            <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {t("mockBank.title") || t("checkout.title") || "Checkout"}
                </h1>
                {session?.merchant && step === "payment" && (
                  <p className="text-sm opacity-70">{session.merchant}</p>
                )}
              </div>

              {step === "payment" && secsLeft !== null && (
                <p className="text-sm opacity-70">
                  {t("mockBank.sessionExpires", {
                    minutes: Math.floor(secsLeft / 60),
                    seconds: String(secsLeft % 60).padStart(2, "0"),
                    defaultValue: `Session expires in ${Math.floor(secsLeft / 60)}:${String(
                      secsLeft % 60
                    ).padStart(2, "0")}`,
                  })}
                </p>
              )}

              <div className="flex gap-2 text-xs font-medium text-gray-500 mt-2 sm:mt-0">
                <span className={step === "details" ? "text-black" : ""}>
                  1. {t("mockBank.stepDetails") || "Contact & delivery"}
                </span>
                <span>›</span>
                <span className={step === "payment" ? "text-black" : ""}>
                  2. {t("mockBank.stepPayment") || "Payment method"}
                </span>
              </div>
            </header>

            {step === "details" ? (
              <form className="mt-4 space-y-4" onSubmit={handleDetailsSubmit}>
                {/* Email */}
                <div>
                  <label className="block text-sm mb-1">
                    {t("checkout.email") || "Email"}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                {/* Delivery switch */}
                <div className="flex items-center gap-2">
                  <input
                    id="delivery-switch"
                    type="checkbox"
                    checked={delivery}
                    onChange={(e) => setDelivery(e.target.checked)}
                  />
                  <label htmlFor="delivery-switch">
                    {t("checkout.delivery") || "Delivery needed"}
                  </label>
                </div>

                {/* Address fields */}
                {delivery && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm mb-1">
                        {t("checkout.street") || "Street"}
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder={t("checkout.streetPlaceholder") || "Street name"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        {t("checkout.houseNumber") || "House number"}
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder={t("checkout.houseNumberPlaceholder") || "12A"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        {t("checkout.apartment") || "Apartment (optional)"}
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder={t("checkout.apartmentPlaceholder") || "Flat, room, etc."}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        {t("checkout.city") || "City"}
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        {t("checkout.postalCode") || "Postal code"}
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm mb-1">
                        {t("checkout.country") || "Country"}
                      </label>
                      <input
                        className="w-full border rounded px-3 py-2"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-60"
                >
                  {creating
                    ? t("common.loading") || "Loading..."
                    : t("checkout.placeOrder") || "Continue to payment"}
                </button>
              </form>
            ) : (
              <div className="space-y-6 mt-4">
                {/* Cart summary – use existing code but swap LT/EN text for t() */}
                <div>
                  <h2 className="font-medium mb-3">
                    {t("mockBank.cartTitle") || "Your cart"}
                  </h2>
                  <div className="divide-y rounded-xl border">
                    {(cartItems?.length ? cartItems : []).map((it) => (
                      <div
                        key={it._id}
                        className="p-3 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {typeof it.name === "object"
                              ? (i18n.language === "lt" ? it.name.lt : it.name.en) ||
                                it.manufacturingID
                              : (it as any).name}
                          </div>
                          <div className="text-sm opacity-70">
                            {t("mockBank.quantityLabel") || "Qty"}: {it.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {new Intl.NumberFormat(locale, {
                              style: "currency",
                              currency: (currency || "EUR") as any,
                            }).format((it.price || 0) * (it.quantity || 0))}
                          </div>
                          <div className="text-sm opacity-70">
                            {new Intl.NumberFormat(locale, {
                              style: "currency",
                              currency: (currency || "EUR") as any,
                            }).format(it.price || 0)}{" "}
                            / {t("mockBank.unit") || "unit"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!cartItems?.length && (
                      <div className="p-4 text-sm opacity-70">
                        {t("mockBank.cartMissing") ||
                          "Cart not available — using total from payment session."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-3">
                    <div className="text-sm opacity-70 mb-1">
                      {t("checkout.email") || "Email"}
                    </div>
                    <div className="font-medium">{checkoutInfo?.email || "—"}</div>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="text-sm opacity-70 mb-1">
                      {t("checkout.delivery") || "Delivery"}
                    </div>
                    <div className="font-medium">
                      {checkoutInfo?.delivery
                        ? t("mockBank.yes") || "Yes"
                        : t("mockBank.no") || "No"}
                    </div>
                  </div>

                  {checkoutInfo?.delivery && checkoutInfo.address && (
                    <div className="sm:col-span-2 rounded-xl border p-3">
                      <div className="text-sm opacity-70 mb-1">
                        {t("checkout.address") || "Delivery address"}
                      </div>
                      <div className="font-medium whitespace-pre-line">
                        {checkoutInfo.address.street} {checkoutInfo.address.houseNumber}
                        {checkoutInfo.address.apartment
                          ? `, ${checkoutInfo.address.apartment}`
                          : ""}
                        {`\n${checkoutInfo.address.postalCode} ${checkoutInfo.address.city}`}
                        {`\n${checkoutInfo.address.country}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* RIGHT — 1/3 */}
          <aside className="space-y-6">
            {/* Total */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {t("mockBank.totalLabel") || "Total"}
                </span>
                <span className="text-xl font-semibold">{displayTotal}</span>
              </div>
            </div>

            {step === "payment" && (
              <>
                {/* Lithuanian banks */}
                <div>
                  <div className="mb-2 text-sm font-medium opacity-80">
                    {t("mockBank.ltBanks") || "Banks in Lithuania"}
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
                                      active:scale-[0.99] ${
                                        deciding || expired
                                          ? "opacity-60 cursor-not-allowed"
                                          : "cursor-pointer"
                                      }`}
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
                    {t("mockBank.intBanks") || "International"}
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
                                      active:scale-[0.99] ${
                                        deciding || expired
                                          ? "opacity-60 cursor-not-allowed"
                                          : "cursor-pointer"
                                      }`}
                        >
                          {src ? <img src={src} alt={label} className="h-6 w-auto" /> : label}
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
              </>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
}
