import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createOrder } from "../dbMiddleware/OrderCRUD";
import { useToast } from "../components/ToastContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [address, setAddress] = useState("");

  const orderItems = cartItems.map(ci => ({
    manufacturingID: ci.manufacturingID,
    quantity: ci.quantity
  }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
        if (delivery && !address.trim()) {
        showToast({ type: "error", message: t("checkout.addressRequired") || "Address is required for delivery" });
        return;
        }
        if (orderItems.length === 0) {
        showToast({ type: "error", message: t("checkout.noItems") || "Your cart is empty" });
        return;
        }
        const created = await createOrder({
          email,
          delivery,
          address: delivery ? address : undefined,
          items: orderItems,
          locale: i18n.language === "lt" ? "lt" : "en",
        });

        showToast({ type: "success", message: t("checkout.success") || "Order created successfully" });
        await startMock(created._id, created.total);

        clearCart();

        showToast({ type: "success", message: t("checkout.success") || "Order created successfully" });
        navigate("/");
        console.log("Created order:", created);
    } catch (err: any) {
        showToast({ type: "error", message: err?.message || (t("checkout.fail") as string) || "Failed to create order" });
    } finally {
        setSubmitting(false);
    }
  };

  const startMock = async (orderId: string, total: number) => {
    const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const origin = window.location.origin;
    const res = await fetch(`${backend}/api/payments/mock/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId,
        amountCents: Math.round(total * 100),
        currency: "EUR",
        successUrl: `${origin}/checkout/success`,
        cancelUrl: `${origin}/checkout/cancel`,
      }),
    });
    if (!res.ok) throw new Error("Failed to start payment");
    const { url } = await res.json();
    window.location.href = url; // go to the fake bank UI
  };


  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-24">
        <h1 className="text-2xl font-semibold mb-6">{t("checkout.title") || "Checkout"}</h1>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm mb-1">{t("checkout.email") || "Email"}</label>
            <input
              type="email"
              required
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input id="delivery" type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
            <label htmlFor="delivery">{t("checkout.delivery") || "Delivery"}</label>
          </div>

          {delivery && (
            <div>
              <label className="block text-sm mb-1">{t("checkout.address") || "Address"}</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("checkout.addressPlaceholder") || "Street, city, ZIP"}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? (t('common.loading') || 'Loading...') : (t('checkout.placeOrder') || 'Place order')}
          </button>
        </form>
      </div>
    </div>
  );
}
