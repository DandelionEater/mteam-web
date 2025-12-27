/* src/components/DesignInfo.tsx */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { Item } from "../model/Item.schema";
import { fetchItemById } from "../dbMiddleware/ItemCRUD";
import { fetchCategories } from "../api/categoryService";
import { Category } from "../model/Category.schema";
import { useToast } from "./ToastContext";

interface DesignInfoProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string | null;
}

const DesignInfo: React.FC<DesignInfoProps> = ({ isOpen, onClose, designId }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const { addToCart, cartItems } = useCart();

  const [design, setDesign] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const { showToast } = useToast();

  const cartQty = useMemo(() => {
    if (!design) return 0;
    const line = cartItems.find((x) => x._id === design._id);
    return line?.quantity ?? 0;
  }, [cartItems, design]);
  const stock = design?.stock ?? 0;
  const outOfStock = stock <= 0;
  const reachedLimit = design ? cartQty >= stock : false;
  const canAdd = design && !outOfStock && !reachedLimit;

  useEffect(() => {
    if (!isOpen || !designId) {
      setDesign(null);
      setError(null);
      setIdx(0);
      return;
    }
    setLoading(true);
    fetchItemById(designId)
      .then(data => setDesign(data))
      .catch(() => setError(t("designInfo.loadError")))
      .finally(() => setLoading(false));
  }, [isOpen, designId, t]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories", err));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
        onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const images = design?.images ?? [];
  const prev = () => setIdx(p => (p === 0 ? images.length - 1 : p - 1));
  const next = () => setIdx(p => (p === images.length - 1 ? 0 : p + 1));

  const addToCartHandler = () => {
    if (!design) return;

    const ok = addToCart(design);

    showToast({
      type: ok ? "success" : "error",
      message: ok ? t("designInfo.floatingMessage") : t("designInfo.stockLimitReached"),
    });
  };

  const categoryLabel =
    categories.find((c) => c._id === design?.category)?.name[lang] ??
    t("designInfo.noCategory");

  const currencySymbol = lang === "lt" ? "€" : "$";
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === "lt" ? "lt-LT" : "en-US", {
        style: "currency",
        currency: lang === "lt" ? "EUR" : "USD",
      }),
    [lang]
  );
  const formatPrice = (price: number) =>
    priceFormatter.format(price).replace(/\u20AC|\$/g, currencySymbol);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 justify-center px-4 overflow-y-auto py-8">
        <div className="flex justify-center">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg relative max-h-[90vh] overflow-y-auto"
          >
            {loading && <p className="text-center">{t("designInfo.loading")}</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {!loading && design && (
              <>
                {/* ---------- images ---------- */}
                {images.length > 0 ? (
                  <div className="relative mb-4">
                    <img
                      src={images[idx]}
                      alt={`${design.name[lang]} ${idx + 1}`}
                      className="w-full h-auto rounded-lg object-contain"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/400x250?text=No+Image")
                      }
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200 transition"
                        >
                          <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                        </button>

                        <button
                          onClick={next}
                          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200 transition"
                        >
                          <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <p>{t("designInfo.noImages")}</p>
                )}

                {/* ---------- text ---------- */}
                <div className="border-gray-700 border-t-2 border-b-2">
                  <h2 className="text-2xl font-bold mt-2 mb-2">{design.name[lang]}</h2>
                  <p className="mb-4 text-gray-700">
                    {design.description?.[lang] || ""}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 font-semibold">
                    {t("designInfo.category")}: {categoryLabel}
                  </p>
                  <p className="mb-2 font-semibold">
                    {t("designInfo.stock")}: {design.stock ?? t("designInfo.noStockInfo")} {t("designInfo.stockExtra")}
                  </p>

                  <p className="mb-2 font-semibold">
                    {t("designInfo.price")}: {formatPrice(design.price)}
                  </p>
                </div>

                {/* ---------- actions ---------- */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => navigate("/contacts")}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition w-1/2"
                  >
                    {t("designInfo.contact")}
                  </button>
                  <button
                    onClick={addToCartHandler}
                    disabled={!canAdd}
                    className={`text-white py-2 px-4 rounded-lg transition w-1/2
                      ${canAdd ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    {stock <= 0 ? t("designInfo.soldOut") : t("designInfo.addToCart")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* close icon */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
        >
          <XMarkIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </>
  );
};

export default DesignInfo;
