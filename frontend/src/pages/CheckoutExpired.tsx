import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CheckoutExpired() {
  const { t } = useTranslation();
  const [left, setLeft] = useState(5);

  useEffect(() => {
    sessionStorage.removeItem("checkoutInfo");
  }, []);

  useEffect(() => {
    const deadline = Date.now() + 5000;
    const id = window.setInterval(() => {
      const remain = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) {
        window.clearInterval(id);
        window.location.replace("/cart");
      }
    }, 200);

    return () => window.clearInterval(id);
  }, []);

  const goNow = () => window.location.assign("/cart");

  return (
    <div className="mx-auto max-w-xl p-6 pt-28">
      <div className="rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">{t("checkoutExpired.title")}</h1>

        <p className="mt-2 opacity-70">{t("checkoutExpired.message")}</p>

        <p className="mt-2 text-sm opacity-60">
          {t("checkoutExpired.redirecting", { seconds: left })}
        </p>

        <div className="mt-6">
          <button
            onClick={goNow}
            className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {t("checkoutExpired.goNow", { seconds: left })}
          </button>
        </div>
      </div>
    </div>
  );
}
