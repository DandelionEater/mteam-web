// src/components/GalleryInfo.tsx
import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTranslation } from 'react-i18next';

interface GalleryItem {
  id: number;
  nameKey: string;
  descriptionKey: string;
  images: string[];
}

interface GalleryInfoProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem;
}

const GalleryInfo: React.FC<GalleryInfoProps> = ({ isOpen, onClose, item }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div ref={modalRef} className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg relative">
        {/* Carousel */}
        <div className="relative mb-4">
          <img
            src={item.images[currentImageIndex]}
            alt={`${t(item.nameKey)} ${currentImageIndex + 1}`}
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x250')}
            className="w-full h-auto rounded-lg object-contain"
          />
          {item.images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 p-2 rounded-full shadow"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 p-2 rounded-full shadow"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">{t(item.nameKey)}</h2>
        <p className="text-gray-700">{t(item.descriptionKey)}</p>
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

export default GalleryInfo;
