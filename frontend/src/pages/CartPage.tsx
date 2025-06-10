import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";

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

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <h1 className="text-center text-3xl font-semibold mb-6">
          {t("cartPage.title")}
        </h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-lg text-gray-500 pt-6">
            {t("cartPage.emptyCart")}
          </p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white shadow-md rounded-lg p-4"
              >
                <div className="flex items-center">
                  <img
                    src={item.images[0]}
                    alt={item.name[lang]}
                    className="h-16 w-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <p className="text-lg font-medium">{item.name[lang]}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    <div className="flex items-center mt-2 gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, Math.max(item.quantity - 1, 1))
                        }
                        className="px-2 py-1 border rounded"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 pr-4"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
          <p className="text-xl font-semibold">
            {t("cartPage.total")}: {formatPrice(total)}
          </p>
          <Link
            to="/checkout"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            {t("cartPage.checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
