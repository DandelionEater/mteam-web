import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CheckoutCancel() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [left, setLeft] = useState(5);

  useEffect(() => {
    sessionStorage.removeItem("checkoutInfo");
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left === 0) navigate("/", { replace: true });
  }, [left, navigate]);

  const goNow = () => navigate("/", { replace: true });

  const tGoBack = i18n.language === "lt" ? `Grįžti (${left}s)` : `Go back (${left}s)`;
  const tTitle = i18n.language === "lt" ? "Mokėjimas atšauktas" : "Payment cancelled";
  const tMsg =
    i18n.language === "lt"
      ? "Mokėjimas neįvyko arba buvo atšauktas."
      : "The payment did not complete or was cancelled.";

  return (
    <div className="mx-auto max-w-xl p-6 pt-28">
      <div className="rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">{tTitle}</h1>
        <p className="mt-2 opacity-70">{tMsg}</p>
        <div className="mt-6">
          <button
            onClick={goNow}
            className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {tGoBack}
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-red-600">
        {i18n.language === "lt"
          ? "Sesijos laikas baigėsi. Netrukus būsite nukreipti į pagrindinį puslapį."
          : "The session expired. You’ll be redirected to the homepage shortly."}
      </p>
    </div>
  );
}