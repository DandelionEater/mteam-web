import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Item } from "../model/Item.schema";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./ToastContext";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

/* ---------- types ---------- */
export type CartItem = Item & { _id: string; quantity: number };

type CartOverlayProps = {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

/* ---------- component ---------- */
export default function CartOverlay({
  items,
  onUpdateQuantity,
  onRemoveItem,
  anchorRef,
  isOpen,
  onClose,
}: CartOverlayProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";

  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleRemoveClick = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem(itemToDelete);
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

  /* ── Position below the anchor (cart icon) ─────────────────── */
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    updatePosition(); // initial

    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, anchorRef]);

  /* ── Hide position when closed ─────────────────────────────── */
  useEffect(() => {
    if (!isOpen) setPosition(null);
  }, [isOpen]);

  /* ── Close on outside click ───────────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  /* ── Helpers ──────────────────────────────────────────────── */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat(lang === "lt" ? "lt-LT" : "en-US", {
      style: "currency",
      currency: lang === "lt" ? "EUR" : "USD",
    })
      .format(price)
      .replace(/\u20AC|\$/g, lang === "lt" ? "€" : "$");

  const total = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  /* ── Early exit ───────────────────────────────────────────── */
  if (!isOpen) return null;

  /* ── UI ───────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-40">
    {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-30 cursor-default"
      />

      <div
        ref={modalRef}
        className="fixed w-80 bg-white shadow-xl rounded-2xl z-50 p-4 border"
        style={{
          top: position?.top ?? -9999,
          right: position?.right ?? -9999,
          visibility: position ? "visible" : "hidden",
        }}
      >
        <h2 className="text-lg font-semibold mb-2">{t("cartPage.title")}</h2>

        {/* empty */}
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">{t("cartPage.emptyCart")}</p>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="flex items-start justify-between">
                <div>
                  <p className="font-medium leading-tight">{item.name[lang]}</p>
                  <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() =>
                        onUpdateQuantity(item._id, Math.max(item.quantity - 1, 1))
                      }
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveClick(item._id)}
                  className="text-red-500 hover:text-red-700 pl-3"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* footer */}
        <div className="mt-4">
          <p className="font-semibold text-right">
            Total: {formatPrice(total)}
          </p>

          <div className="flex gap-2 mt-3">
            <Link
              to="/cart"
              className="w-full px-4 py-2 border rounded hover:bg-gray-100 text-center"
              onClick={onClose}
            >
              {t("cartPage.goToCart")}
            </Link>

            <button
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              /* TODO: wire up checkout */
            >
              {t("cartPage.checkout")}
            </button>
          </div>
        </div>
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
}
