import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { CartItem } from "../types";

type CartOverlayProps = {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

export default function CartOverlay({
  items,
  onUpdateQuantity,
  onRemoveItem,
  anchorRef,
  isOpen,
  onClose
}: CartOverlayProps) {
  const { i18n } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Calculate total directly from numeric price
  const total = items.reduce((acc, item) => {
    return acc + item.price * (item.quantity ?? 1);
  }, 0);

  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [anchorRef, items.length, isOpen]);

  const formatPrice = (price: number): string => {
    const locale = i18n.language === 'lt' ? 'lt-LT' : 'en-US';
    const currencySymbol = i18n.language === 'lt' ? '€' : '$';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.language === 'lt' ? 'EUR' : 'USD',
    }).format(price).replace(/\u20AC|\$/g, currencySymbol);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute w-80 bg-white shadow-xl rounded-2xl z-50 p-4 border"
      style={{ top: position.top, right: position.right }}
    >
      <h2 className="text-lg font-semibold mb-2">Your Cart</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Cart is empty</p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                <div className="flex items-center mt-1 gap-2">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.id, Math.max((item.quantity ?? 1) - 1, 1))
                    }
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity ?? 1}</span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.id, (item.quantity ?? 1) + 1)
                    }
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <p className="font-semibold text-right">Total: {formatPrice(total)}</p>
        <div className="flex gap-2 mt-3">
          <button className="w-full px-4 py-2 border rounded hover:bg-gray-100">
            Go to Cart
          </button>
          <button className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
