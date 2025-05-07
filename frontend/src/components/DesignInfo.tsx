import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { BaseDesign } from '../types';

interface DesignInfoProps {
  isOpen: boolean;
  onClose: () => void;
  design: BaseDesign;
}

const DesignInfo: React.FC<DesignInfoProps> = ({
  isOpen,
  onClose,
  design
}) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [showMessage, setShowMessage] = useState(false);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const cartItem = { ...design, quantity: 1 };
    addToCart(cartItem);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        {/* Modal */}
        <div
          ref={modalRef}
          className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg relative"
        >
          <img src={design.image} alt={t(design.nameKey)} className="w-full h-auto rounded-lg mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t(design.nameKey)}</h2>
          <p className="text-gray-700 mb-4">{t(design.descriptionKey)}</p>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {t('designInfo.price')}: {design.price}
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/contacts')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 w-full transition rounded-xl"
            >
              {t('designInfo.contact')}
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 w-full transition rounded-xl"
            >
              {t('designInfo.addToCart')}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
        >
          <XMarkIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Floating Message */}
      {showMessage && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          <p className='text-center'>{t('designInfo.floatingMessage')}</p>
        </div>
      )}
    </>
  );
};

export default DesignInfo;
