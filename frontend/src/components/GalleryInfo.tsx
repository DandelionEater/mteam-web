import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTranslation } from 'react-i18next';
import { Gallery } from '../model/Item.schema';
import { fetchGalleryItemById } from "../dbMiddleware/GalleryCRUD";

interface GalleryInfoProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

const GalleryInfo: React.FC<GalleryInfoProps> = ({ isOpen, onClose, itemId }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'lt';

  const modalRef = useRef<HTMLDivElement>(null);
  const [item, setItem] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  useEffect(() => {
    if (!isOpen || !itemId) return;

    let ignore = false;
    setLoading(true);

    fetchGalleryItemById(itemId)
      .then((data) => {
        if (!ignore) {
          setItem(data);
          setCurrentImageIndex(0);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load gallery item:", err);
          setItem(null);
        }
      })
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [isOpen, itemId]);

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
    setCurrentImageIndex(prev =>
      prev === 0 ? (item?.images.length ?? 1) - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex(prev =>
      prev === (item?.images.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 items-center px-4 overflow-y-auto py-8">
      <div className="flex justify-center">
        <div
          ref={modalRef}
          className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg relative"
        >
          {loading ? (
            <div className="text-center text-gray-600 py-12">Loading...</div>
          ) : item ? (
            <>
              {/* Image carousel */}
              <div className="relative mb-4">
                <img
                  src={item.images[currentImageIndex]}
                  alt={`${item.name[lang]} ${currentImageIndex + 1}`}
                  onError={(e) =>
                    (e.currentTarget.src = 'https://via.placeholder.com/400x250')
                  }
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

              <h2 className="text-2xl font-bold mb-2">{item.name[lang]}</h2>
              <p className="text-gray-700">{item.description?.[lang]}</p>
            </>
          ) : (
            <div className="text-center text-red-500">Failed to load item</div>
          )}
        </div>
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
