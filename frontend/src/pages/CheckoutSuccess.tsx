import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";

export default function CheckoutSuccess() {
  const { i18n } = useTranslation();
  const { clearCart } = useCart();
  const [left, setLeft] = useState(5);

  useEffect(() => {
    clearCart();
    sessionStorage.removeItem("checkoutInfo");
  }, [clearCart]);

  useEffect(() => {
    const deadline = Date.now() + 5000;
    const id = setInterval(() => {
      const remain = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) {
        clearInterval(id);
        window.location.replace("/"); // hard redirect so the page actually changes
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  const goNow = () => window.location.assign("/");

  return (
    <div className="mx-auto max-w-xl p-6 pt-28">
      <div className="rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">
          {i18n.language === "lt" ? "Apmokėjimas pavyko" : "Payment successful"}
        </h1>
        <p className="mt-2 opacity-70">
          {i18n.language === "lt" ? "Ačiū! Jūsų užsakymas priimtas." : "Thanks! Your order has been received."}
        </p>
        <div className="mt-6">
          <button
            onClick={goNow}
            className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {i18n.language === "lt" ? `Grįžti (${left}s)` : `Go back (${left}s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
