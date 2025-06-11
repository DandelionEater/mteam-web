import { useState, useEffect } from "react";
import { fetchGalleryItems } from "../dbMiddleware/GalleryCRUD";
import GalleryInfo from "../components/GalleryInfo";
import { useTranslation } from "react-i18next";
import { Gallery as GalleryItem } from "../model/Item.schema";
import { useItemsPerRow } from "../hooks/useItemPerRow";

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const { containerRef, itemRef, itemsPerRow } = useItemsPerRow();
  const itemsPerPage = Math.max(itemsPerRow, 1) * 5;

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetchGalleryItems()
      .then((data) => !ignore && setItems(data))
      .catch((e) =>
        !ignore &&
        setError(
          e instanceof Error ? e.message : t("gallery.loadError" as never)
        )
      )
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [t]);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  if (loading)
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p>{t("gallery.loading")}</p>
      </section>
    );

  if (error)
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </section>
    );

  return (
    <section className="bg-white py-16 px-6 min-h-screen pt-28">
      <div className="w-full">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 text-center pt-4">
          {t("gallery.title")}
        </h2>
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-500">{t("gallery.empty")}</p>
      )}

      {/* grid */}
      <div
        ref={containerRef}
        className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {paginatedItems.map((item, i) => (
          <div
            key={item._id}
            ref={i === 0 ? itemRef : null}
            onClick={() => {
              if (item._id) setSelectedItem(item._id);
            }}
            className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer h-56"
          >
            <img
              src={
                item.images?.[0] ?? "https://via.placeholder.com/400x250?text=No+Image"
              }
              alt={item.name[lang]}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-xl font-bold text-center">
                {item.name[lang]}
              </h3>
              <p className="text-sm mt-2 px-4 text-center">
                {item.description?.[lang]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 border rounded ${
                  currentPage === pageNum
                    ? "bg-gray-900 text-white"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <GalleryInfo
          isOpen
          onClose={() => setSelectedItem(null)}
          itemId={selectedItem}
        />
      )}
    </section>
  );
};

export default Gallery;
