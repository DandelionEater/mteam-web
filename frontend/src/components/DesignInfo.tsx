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

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const DesignInfo: React.FC<DesignInfoProps> = ({ isOpen, onClose, designId }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const { addToCart, cartItems } = useCart();
  const { showToast } = useToast();

  const [design, setDesign] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qty, setQty] = useState(1);

  const cartQty = useMemo(() => {
    if (!design) return 0;
    const line = cartItems.find((x) => x._id === design._id);
    return line?.quantity ?? 0;
  }, [cartItems, design]);

  const stock = design?.stock ?? 0;
  const outOfStock = stock <= 0;
  const remaining = Math.max(0, stock - cartQty);
  const reachedLimit = design ? cartQty >= stock : false;
  const canAdd = !!design && !outOfStock && !reachedLimit && qty > 0;

  useEffect(() => {
    if (!isOpen || !designId) {
      setDesign(null);
      setError(null);
      setIdx(0);
      setQty(1);
      return;
    }
    setLoading(true);
    fetchItemById(designId)
      .then((data) => {
        setDesign(data);
        setIdx(0);
        // kiek galima pridėti (atsižvelgiant į tai, kas jau krepšelyje)
        const nextMax = Math.max(1, (data.stock ?? 0) - cartQty);
        setQty((q) => clamp(q, 1, nextMax));
      })
      .catch(() => setError(t("designInfo.loadError")))
      .finally(() => setLoading(false));
    // cartQty sąmoningai nededam į deps, kad neperload’intų item kiekvieną kartą
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, designId, t]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories", err));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Kai keičiasi krepšelis ar stock, perskaičiuojam max qty
  useEffect(() => {
    if (!design) return;
    const nextMax = Math.max(1, (design.stock ?? 0) - cartQty);
    setQty((q) => clamp(q, 1, nextMax));
  }, [design, cartQty]);

  const images = design?.images ?? [];
  const prev = () => setIdx((p) => (p === 0 ? images.length - 1 : p - 1));
  const next = () => setIdx((p) => (p === images.length - 1 ? 0 : p + 1));

  const categoryLabel =
    categories.find((c) => c._id === design?.category)?.name[lang] ?? t("designInfo.noCategory");

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === "lt" ? "lt-LT" : "en-US", {
        style: "currency",
        currency: lang === "lt" ? "EUR" : "USD",
      }),
    [lang]
  );

  const addToCartHandler = () => {
    if (!design) return;

    const maxAdd = Math.max(0, (design.stock ?? 0) - cartQty);
    const toAdd = clamp(qty, 1, Math.max(1, maxAdd));

    let added = 0;
    for (let i = 0; i < toAdd; i++) {
      const ok = addToCart(design);
      if (!ok) break;
      added++;
    }

    if (added > 0) {
      showToast({
        type: "success",
        message:
          t("designInfo.floatingMessage") ||
          (lang === "lt" ? "Prekė pridėta į krepšelį" : "Added to cart"),
      });
    } else {
      showToast({
        type: "error",
        message: t("designInfo.stockLimitReached"),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      {/* close */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-60 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
        aria-label={t("common.close") || "Close"}
      >
        <XMarkIcon className="w-5 h-5 text-gray-700" />
      </button>

      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center px-4 overflow-y-auto">
        <div
          ref={modalRef}
          className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border"
        >
          {loading && <p className="p-8 text-center">{t("designInfo.loading")}</p>}
          {error && <p className="p-8 text-center text-red-600">{error}</p>}

          {!loading && design && (
            <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
              {/* LEFT: image */}
              <div
                className="
                  relative bg-gray-50 overflow-hidden
                  h-64 md:h-full
                  rounded-t-2xl md:rounded-t-none md:rounded-l-2xl
                "
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[idx]}
                      alt={`${design.name[lang]} ${idx + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/900x675?text=No+Image")
                      }
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          className="absolute top-1/2 left-3 -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow hover:bg-white transition"
                          aria-label={t("common.prev") || "Previous"}
                        >
                          <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                        </button>

                        <button
                          onClick={next}
                          className="absolute top-1/2 right-3 -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow hover:bg-white transition"
                          aria-label={t("common.next") || "Next"}
                        >
                          <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                        </button>
                      </>
                    )}

                    {/* small dots */}
                    {images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`h-2 w-2 rounded-full transition ${
                              i === idx ? "bg-black/80" : "bg-black/20 hover:bg-black/40"
                            }`}
                            aria-label={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-10 text-center">{t("designInfo.noImages")}</div>
                )}
              </div>

              {/* RIGHT: content */}
              <div className="p-6 md:p-8 flex flex-col">
                {/* Title + desc */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                    {design.name[lang]}
                  </h2>
                  {design.description?.[lang] && (
                    <p className="mt-3 text-gray-600 leading-relaxed">
                      {design.description[lang]}
                    </p>
                  )}
                </div>

                {/* meta */}
                <div className="mt-6 space-y-3">
                  {/* category row */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-gray-500">
                      {t("designInfo.category") || "Category"}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{categoryLabel}</span>
                  </div>

                  {/* stock + price row */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex-1 min-w-[160px] rounded-xl border bg-gray-50 px-4 py-3">
                      <div className="text-xs text-gray-500">
                        {t("designInfo.stock") || "Stock"}
                      </div>
                      <div className="mt-1 font-semibold text-gray-900">
                        {design.stock ?? t("designInfo.noStockInfo")}{" "}
                        {t("designInfo.stockExtra") || ""}
                      </div>
                      {cartQty > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          {lang === "lt"
                            ? `Krepšelyje: ${cartQty} • Liko pridėti: ${remaining}`
                            : `In cart: ${cartQty} • Remaining: ${remaining}`}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-[160px] rounded-xl border bg-gray-50 px-4 py-3">
                      <div className="text-xs text-gray-500">
                        {t("designInfo.price") || "Price"}
                      </div>
                      <div className="mt-1 font-semibold text-gray-900">
                        {priceFormatter.format(design.price)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* qty + actions */}
                <div className="mt-6 border-t pt-5">
                  <div className="flex flex-col gap-4">
                    {/* qty picker */}
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm text-gray-600">
                        {lang === "lt" ? "Kiekis" : "Quantity"}
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQty((q) => clamp(q - 1, 1, Math.max(1, remaining || 1)))}
                          disabled={outOfStock || reachedLimit || qty <= 1}
                          className="h-10 w-10 rounded-xl border bg-white hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Decrease"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, remaining || 1)}
                          value={qty}
                          onChange={(e) =>
                            setQty(clamp(Number(e.target.value || 1), 1, Math.max(1, remaining || 1)))
                          }
                          disabled={outOfStock || reachedLimit}
                          className="h-10 w-20 rounded-xl border px-3 text-center outline-none focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
                        />

                        <button
                          type="button"
                          onClick={() => setQty((q) => clamp(q + 1, 1, Math.max(1, remaining || 1)))}
                          disabled={outOfStock || reachedLimit || qty >= Math.max(1, remaining || 1)}
                          className="h-10 w-10 rounded-xl border bg-white hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate("/contacts")}
                        className="h-11 rounded-xl border bg-white font-medium hover:bg-gray-50 transition"
                      >
                        {t("designInfo.contact") || "Contact"}
                      </button>

                      <button
                        onClick={addToCartHandler}
                        disabled={!canAdd}
                        className={`h-11 rounded-xl font-medium transition ${
                          canAdd
                            ? "bg-black text-white hover:bg-gray-900"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {outOfStock
                          ? t("designInfo.soldOut") || (lang === "lt" ? "Išparduota" : "Sold out")
                          : t("designInfo.addToCart") || (lang === "lt" ? "Pridėti į krepšelį" : "Add to cart")}
                      </button>
                    </div>

                    {!outOfStock && reachedLimit && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        {t("designInfo.stockLimitReached")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignInfo;
