// src/pages/Designs.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import DesignInfo from "../components/DesignInfo";
import { fetchItems } from "../dbMiddleware/ItemCRUD";
import { useItemsPerRow } from "../hooks/useItemPerRow";

type DisplayItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryName: string;
};

const Designs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "lt" ? "lt" : "en";
  const { containerRef, itemRef, itemsPerRow } = useItemsPerRow();
  const itemsPerPage = Math.max(itemsPerRow, 1) * 5;

  /* ------------------------------------------------------------------ */
  /* LOAD ITEMS FROM BACKEND                                            */
  /* ------------------------------------------------------------------ */
  const [designs, setDesigns] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await fetchItems();
        const mapped: DisplayItem[] = raw.map((it) => {
        const id = (it as any)._id as string;
        return {
          id,
          name: it.name?.[lang] ?? "",
          description: it.description?.[lang] ?? "",
          price: it.price,
          stock: it.stock,
          images: it.images,
          categoryName:
            typeof it.category === "string"
              ? it.category
              : (it.category as any)?.name?.[lang] ?? "",
        };
      });
        setDesigns(mapped);
      } catch (err) {
        console.error("Failed to fetch items", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [lang]);

  /* ------------------------------------------------------------------ */
  /* CATEGORY LIST & FILTERING                                          */
  /* ------------------------------------------------------------------ */
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(designs.map((d) => d.categoryName))).filter(Boolean),
    [designs]
  );

  const filteredDesigns = selectedCategory
    ? designs.filter((d) => d.categoryName === selectedCategory)
    : designs;

  /* ------------------------------------------------------------------ */
  /* PRICE FORMATTER                                                    */
  /* ------------------------------------------------------------------ */
  const currencySymbol = lang === "lt" ? "€" : "$";
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === "lt" ? "lt-LT" : "en-US", {
        style: "currency",
        currency: lang === "lt" ? "EUR" : "USD",
      }),
    [lang]
  );
  const formatPrice = (p: number) =>
    priceFormatter.format(p).replace(/\u20AC|\$/g, currencySymbol);

  /* ------------------------------------------------------------------ */
  /* MODAL SELECTION HANDLING                                           */
  /* ------------------------------------------------------------------ */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSelect = (d: DisplayItem) => setSelectedId(d.id);

  /* ------------------------------------------------------------------ */
  /* MOBILE FILTER PANEL TOGGLE                                         */
  /* ------------------------------------------------------------------ */
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsMobileFilterOpen(false);
      }
    };
    if (isMobileFilterOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isMobileFilterOpen]);

    /* ------------------------------------------------------------------ */
    /* PAGINATION                                                         */
    /* ------------------------------------------------------------------ */
    const [currentPage, setCurrentPage] = useState(1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDesigns = filteredDesigns.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage);

    useEffect(() => {
      setCurrentPage(1);
    }, [itemsPerRow, selectedCategory, filteredDesigns.length]);

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-lg text-gray-700">{t("designs.loading")}</p>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 px-6 min-h-screen pt-28">
      <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
        {t("designs.title")}
      </h2>

      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg"
          onClick={() => setIsMobileFilterOpen((p) => !p)}
        >
          {t("categories.filter")}
        </button>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start gap-6">
        {/* Category filter */}
        <div
          ref={filterRef}
          className={`md:w-1/4 bg-gray-100 p-4 rounded-lg ${
            isMobileFilterOpen ? "block" : "hidden md:block"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4 text-center">
            {t("categories.filterByCategory")}
          </h3>

          <ul className="space-y-4">
            <li>
              <button
                className={`w-full px-4 py-2 border rounded-lg text-left transition ${
                  selectedCategory === "" ? "bg-gray-300" : "hover:bg-gray-200"
                }`}
                onClick={() => {
                  setSelectedCategory("");
                  setIsMobileFilterOpen(false);
                }}
              >
                {t("categories.all")}
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  className={`w-full px-4 py-2 border rounded-lg text-left transition ${
                    selectedCategory === cat ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Grid */}
        <div className="md:w-3/4">
          <div
            ref={containerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedDesigns.length === 0 ? (
              <p className="text-center text-lg text-gray-500 col-span-full">
                {t("designs.empty")}
              </p>
            ) : (
              paginatedDesigns.map((d, i) => (
                <div
                  key={d.id}
                  ref={i === 0 ? itemRef : null}
                  onClick={() => handleSelect(d)}
                  className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer h-56"
                >
                  <img
                    src={d.images[0] || "https://placehold.co/400x300?text=No+Image"}
                    alt={d.name}
                    className="w-full h-56 object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <h3 className="text-xl font-bold">{d.name}</h3>
                    <p className="text-sm mt-2 px-4 text-center">{d.description}</p>
                    <p className="text-lg font-semibold mt-2">{formatPrice(d.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          {Array.from({ length: totalPages }, (_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`mx-1 px-4 py-2 rounded-lg border transition
                  ${page === currentPage
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {/* Info Modal */}
      <DesignInfo
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        designId={selectedId}
      />
    </section>
  );
};

export default Designs;
