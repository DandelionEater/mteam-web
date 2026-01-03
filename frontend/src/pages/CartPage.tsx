import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/ToastContext";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";

  const navigate = useNavigate();

  const formatPrice = (price: number): string => {
    const locale = lang === "lt" ? "lt-LT" : "en-US";
    const currencySymbol = lang === "lt" ? "€" : "$";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: lang === "lt" ? "EUR" : "USD",
    })
      .format(price)
      .replace(/\u20AC|\$/g, currencySymbol);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleRemoveClick = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete);
    }
    setConfirmOpen(false);
    setItemToDelete(null);
    showToast({
      type: "success",
      message: t("toast.success")
    });
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-28 sm:pb-10">
        <h1 className="text-center text-2xl sm:text-3xl font-semibold mb-6">
          {t("cartPage.title")}
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 text-center">
            <p className="text-gray-600">{t("cartPage.emptyCart")}</p>

            <button
              type="button"
              onClick={() => navigate("/designs")}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900"
            >
              {t("cartPage.continueShopping") ?? "Continue shopping"}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const stock = item.stock ?? Infinity;
                const canIncrease = item.quantity < stock;

                const img =
                  item.images?.[0] || "https://placehold.co/96x96?text=%20";

                const lineTotal = item.price * item.quantity;

                return (
                  <div
                    key={item._id}
                    className="bg-white border rounded-2xl shadow-sm p-4"
                  >
                    <div className="flex gap-3">
                      <img
                        src={img}
                        alt={item.name[lang]}
                        className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                        loading="lazy"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 break-words">
                              {item.name[lang]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveClick(item._id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            aria-label={t("cartPage.removeItem") ?? "Remove"}
                            title={t("cartPage.removeItem") ?? "Remove"}
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          {/* quantity stepper */}
                          <div className="inline-flex items-center rounded-xl border bg-gray-50 overflow-hidden">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, Math.max(item.quantity - 1, 1))
                              }
                              className="px-3 py-2 hover:bg-gray-100"
                              aria-label="Decrease"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>

                            <span className="px-3 text-sm font-semibold tabular-nums">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => {
                                if (!canIncrease) {
                                  showToast({
                                    type: "error",
                                    message: t("designInfo.stockLimitReached"),
                                  });
                                  return;
                                }
                                updateQuantity(item._id, item.quantity + 1);
                              }}
                              disabled={!canIncrease}
                              className={`px-3 py-2 hover:bg-gray-100 ${
                                !canIncrease ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              aria-label="Increase"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {/* qty × unit + line total */}
                          <div className="text-right tabular-nums">
                            <p className="text-xs text-gray-500">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {formatPrice(lineTotal)}
                            </p>
                          </div>
                        </div>

                        {Number.isFinite(stock) && stock <= 0 && (
                          <p className="text-xs text-red-600 mt-2">
                            {t("designInfo.soldOut")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* desktop summary */}
            <div className="mt-6 bg-white border rounded-2xl shadow-sm p-4 hidden sm:flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t("cartPage.total")}</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatPrice(total)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (cartItems.length === 0) {
                    showToast({ type: "error", message: t("mockbank.noItems") });
                    return;
                  }
                  navigate("/mock-bank");
                }}
                disabled={cartItems.length === 0}
                className={`px-5 py-3 rounded-xl text-white font-medium
                  ${cartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-900"
                  }`}
              >
                {t("cartPage.checkout")}
              </button>
            </div>

            {/* mobile bottom bar */}
            <div className="sm:hidden fixed left-0 right-0 bottom-0 bg-white border-t">
              <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{t("cartPage.total")}</p>
                  <p className="text-lg font-semibold tabular-nums truncate">
                    {formatPrice(total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (cartItems.length === 0) {
                      showToast({ type: "error", message: t("mockbank.noItems") });
                      return;
                    }
                    navigate("/mock-bank");
                  }}
                  disabled={cartItems.length === 0}
                  className={`px-5 py-3 rounded-xl text-white font-medium whitespace-nowrap
                    ${cartItems.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-900"
                    }`}
                >
                  {t("cartPage.checkout")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Confirmation dialog */}
        <ConfirmDialog
          isOpen={confirmOpen}
          title={t("cartPage.confirmTitle")}
          message={t("cartPage.confirmMessage")}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );

};

export default CartPage;
