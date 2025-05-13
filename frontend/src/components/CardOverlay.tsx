import React, { useRef } from 'react';
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from 'react-i18next';

interface CardOverlayProps {
  activeIndex: number | null;
  onClose: () => void;
}

const CardOverlay: React.FC<CardOverlayProps> = ({ activeIndex, onClose }) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  if (activeIndex === null) return null;

  const titleKey = `home.card${activeIndex}Title`;
  const descKey = `home.card${activeIndex}Description`;
  const extraKey = `home.card${activeIndex}Extra`;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div 
        onClick={handleBackdropClick} 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div 
        ref={contentRef} 
        className="bg-white rounded-lg p-6 max-w-lg relative"
      >
        <h2 className="text-2xl font-semibold mb-2 text-black">{t(titleKey)}</h2>
        <p className="text-black mb-4">{t(descKey)}</p>
        <p className="text-gray-600">{t(extraKey)}</p>
      </div>
      <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
        >
          <XMarkIcon className="w-5 h-5 text-gray-700" />
        </button>
    </div>
  );
};

export default CardOverlay;
