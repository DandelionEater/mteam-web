import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { Gallery } from "../model/Item.schema";
import { fetchGalleryItemById } from "../dbMiddleware/GalleryCRUD";

interface GalleryInfoProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

const GalleryInfo: React.FC<GalleryInfoProps> = ({ isOpen, onClose, itemId }) => {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language === "lt" ? "lt" : "en") as "en" | "lt";

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
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const images = item?.images ?? [];

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? Math.max(images.length - 1, 0) : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === Math.max(images.length - 1, 0) ? 0 : prev + 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center px-4 overflow-y-auto py-8">
      {/* close */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-60 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
        aria-label={t("common.close") || "Close"}
      >
        <XMarkIcon className="w-5 h-5 text-gray-700" />
      </button>

      <div
        ref={modalRef}
        className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border overflow-hidden"
        style={{ maxHeight: "calc(100vh - 4rem)" }}   // 4rem ~ py-8 (viršus+apačia)
      >
        {loading ? (
          <div className="p-10 text-center text-gray-600">Loading...</div>
        ) : item ? (
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
            {/* LEFT: image */}
            <div
              className="
                relative bg-gray-50 overflow-hidden
                h-64 md:h-full
                max-h-screen
                flex items-center justify-center
                rounded-t-2xl md:rounded-t-none md:rounded-l-2xl
              "
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${item.name?.[lang] ?? "Image"} ${currentImageIndex + 1}`}
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/900x675?text=No+Image")}
                    className="h-full w-full object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow hover:bg-white transition"
                        aria-label={t("common.prev") || "Previous"}
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow hover:bg-white transition"
                        aria-label={t("common.next") || "Next"}
                      >
                        <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="p-10 text-center text-gray-600">
                  {t("gallery.noImages") || "No images"}
                </div>
              )}
            </div>

            {/* RIGHT: content */}
            <div className="p-6 md:p-8 flex flex-col">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                  {item.name?.[lang] ?? ""}
                </h2>

                {item.description?.[lang] && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {item.description[lang]}
                  </p>
                )}
              </div>

              {/* optional: little info box (nice polish) */}
              <div className="mt-6 border-t pt-4">
                <div className="text-sm text-gray-500">
                  {t("gallery.imagesCount") || "Images"}:{" "}
                  <span className="font-medium text-gray-900">{images.length}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-red-600">Failed to load item</div>
        )}
      </div>
    </div>
  );
};

export default GalleryInfo;
