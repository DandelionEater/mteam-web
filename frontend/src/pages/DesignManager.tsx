import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { DesignItem } from '../data/designs';
import { GalleryItem, LocalizedString } from '../data/gallery';
import { CategoriesItem } from '../data/categories';
import { fetchItems, deleteItem } from "../dbMiddleware/ItemCRUD";
import { fetchGalleryItems, deleteGalleryItem } from "../dbMiddleware/GalleryCRUD";
import { fetchCategories, deleteCategory } from "../dbMiddleware/CategoryCRUD";
import ConfirmDialog from '../components/ConfirmDialog';
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useToast } from '../components/ToastContext';
import OrdersPanel from '../components/OrdersPanel';

const DesignManager = () => {
  const { t, i18n } = useTranslation();
  const [designList, setDesignList] = useState<DesignItem[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [categoryList, setCategoryList] = useState<CategoriesItem[]>([]);
  const [confirm, setConfirm] = useState<{
    id: string;
    type: 'design' | 'gallery' | 'category';
  } | null>(null);
  const { showToast } = useToast();

  const [designSearch, setDesignSearch] = useState("");
  const [gallerySearch, setGallerySearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  
  const params = new URLSearchParams(location.search);
  const tabParam = params.get('tab') as 'designs' | 'gallery' | 'categories' | 'orders' | null;
  const defaultTab: 'designs' | 'gallery' | 'orders' | 'categories' = tabParam || 'designs';

  const [activePage, setActivePage] = useState(defaultTab);

  const getLocalizedString = (field: LocalizedString): string => {
    if (!i18n.language) return field.en ?? "";
    if (i18n.language === "en") return field.en ?? "";
    return field.lt ?? "";
  };

  const navigate = useNavigate();

  // Currency formatting stuff same as before
  const currencySymbol = i18n.language === 'lt' ? '€' : '$';
  const locale = i18n.language === 'lt' ? 'lt-LT' : 'en-US';
  const currency = i18n.language === 'lt' ? 'EUR' : 'USD';

  const priceFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    });
  }, [locale, currency]);

  const formatPrice = (price: number): string => {
    return priceFormatter.format(price).replace(/\u20AC|\$/g, currencySymbol);
  };

  const normalizedDesignSearch = designSearch.trim().toLowerCase();
  const normalizedGallerySearch = gallerySearch.trim().toLowerCase();
  const normalizedCategorySearch = categorySearch.trim().toLowerCase();

  const filteredDesigns = useMemo(() => {
    if (!normalizedDesignSearch) return designList;

    return designList.filter((design) => {
      const nameText = getLocalizedString(design.name).toLowerCase();
      const descText = getLocalizedString(
        (design.description as any) ?? { en: "", lt: "" }
      ).toLowerCase();

      return (
        nameText.includes(normalizedDesignSearch) ||
        descText.includes(normalizedDesignSearch)
      );
    });
  }, [designList, normalizedDesignSearch, i18n.language]);

  const filteredGallery = useMemo(() => {
    if (!normalizedGallerySearch) return galleryList;

    return galleryList.filter((item) => {
      const nameText = getLocalizedString(item.name).toLowerCase();
      const descText = getLocalizedString(
        item.description ?? { en: "", lt: "" }
      ).toLowerCase();

      return (
        nameText.includes(normalizedGallerySearch) ||
        descText.includes(normalizedGallerySearch)
      );
    });
  }, [galleryList, normalizedGallerySearch, i18n.language]);

  const filteredCategories = useMemo(() => {
    if (!normalizedCategorySearch) return categoryList;

    return categoryList.filter((cat) => {
      const nameText = getLocalizedString(cat.name).toLowerCase();
      return nameText.includes(normalizedCategorySearch);
    });
  }, [categoryList, normalizedCategorySearch, i18n.language]);

  // Sub-page loader
  useEffect(() => {
    if (tabParam && tabParam !== activePage) {
      setActivePage(tabParam);
    }
  }, [tabParam]);

  const onChangeTab = (page: 'designs' | 'gallery' | 'categories' | 'orders') => {
    setActivePage(page);

    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', page);
    navigate({ search: newParams.toString() }, { replace: true });
  };

  // Load designs
  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const rawData = await fetchItems();
        const mappedData: DesignItem[] = rawData.map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          manufacturingID: item.manufacturingID,
          category: item.category,
          price: item.price,
          stock: item.stock,
          quantity: item.quantity,
          images: item.images,
        }));
        setDesignList(mappedData);
      } catch (error) {
        console.error("Failed to load items", error);
      }
    };
    loadDesigns();
  }, []);

  // Load gallery
  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await fetchGalleryItems();
        const galleryItems: GalleryItem[] = data.map(item => ({
          id: (item as any)._id || "",
          images: item.images,
          name: item.name,
          description: item.description || { en: "", lt: "" },
        }));
        setGalleryList(galleryItems);
      } catch (error) {
        console.error("Failed to load gallery items", error);
      }
    };
    loadGallery();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        const validData: CategoriesItem[] = data.map((item: any) => ({
          id: item._id,
          name: item.name,
        }));
        setCategoryList(validData);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: React.ReactNode[] = [];

    let start = 0;
    let index: number;
    let key = 0;

    while ((index = lowerText.indexOf(lowerQuery, start)) !== -1) {
      if (index > start) {
        parts.push(text.slice(start, index));
      }
      parts.push(
        <mark key={key++} className="bg-yellow-200 rounded-sm px-0.5">
          {text.slice(index, index + query.length)}
        </mark>
      );
      start = index + query.length;
    }

    if (start < text.length) {
      parts.push(text.slice(start));
    }

    return <>{parts}</>;
  };

  // Designs handlers
  const handleAddDesign = () => {
    navigate('/admin-manager/add');
  };
  const handleEditDesign = (id: string) => {
    navigate(`/admin-manager/edit/${id}`);
  };

  // Gallery handlers
  const handleAddGallery = () => {
    navigate('/admin-manager/gallery/add');
  };
  const handleEditGallery = (id: string) => {
    navigate(`/admin-manager/gallery/edit/${id}`);
  };

  // Categories handlers
  const handleAddCategory = () => {
    navigate('/admin-manager/category/add');
  };
  const handleEditCategory = (id: string) => {
    navigate(`/admin-manager/category/edit/${id}`);
  };

  // Confirmation Dialog handlers
  const askDelete = (id: string, type: 'design' | 'gallery' | 'category') =>
    setConfirm({ id, type });

  const confirmDelete = async () => {
    if (!confirm) return;
    const { id, type } = confirm;

    try {
      if (type === 'design') {
        await deleteItem(id);
        showToast({
          type: "success",
          message: t("adminToast.success")
        });
        setDesignList(prev => prev.filter(d => d.id !== id));
      } else if (type === 'gallery') {
        await deleteGalleryItem(id);
        showToast({
          type: "success",
          message: t("adminToast.success")
        });
        setGalleryList(prev => prev.filter(g => g.id !== id));
      } else if (type === 'category') {
        await deleteCategory(id);
        showToast({
          type: "success",
          message: t("adminToast.success")
        });
        setCategoryList(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setConfirm(null);
      showToast({
        type: "error",
        message: t("adminToast.error")
      });
    }
  };

  const cancelDelete = () => setConfirm(null);

  return (
    <div className="min-h-screen bg-gray-100 py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <h1 className="text-center text-3xl font-semibold mb-6">{t('designManager.title')}</h1>

        {/* Toggle between Designs, Gallery, Categories and Orders */}
        <div className="mb-6">
          {/* Mobile: dropdown */}
          <div className="md:hidden mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("admin.selectSection") || "Select section"}
            </label>
            <select
              value={activePage}
              onChange={(e) =>
                onChangeTab(e.target.value as "designs" | "gallery" | "categories" | "orders")
              }
              className="w-full max-w-full border rounded-md px-3 py-2 bg-white"
            >
              <option value="designs">{t("nav.designs")}</option>
              <option value="gallery">{t("nav.gallery")}</option>
              <option value="categories">{t("categories.admin")}</option>
              <option value="orders">{t("designManager.orders") || "Orders"}</option>
            </select>
          </div>

          {/* Desktop / tablet: horizontal buttons */}
          <div className="hidden md:flex justify-center">
            <div className="inline-flex rounded overflow-hidden shadow-sm">
              <button
                onClick={() => onChangeTab("designs")}
                className={`px-4 py-2 text-sm ${
                  activePage === "designs"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {t("nav.designs")}
              </button>
              <button
                onClick={() => onChangeTab("gallery")}
                className={`px-4 py-2 text-sm ${
                  activePage === "gallery"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {t("nav.gallery")}
              </button>
              <button
                onClick={() => onChangeTab("categories")}
                className={`px-4 py-2 text-sm ${
                  activePage === "categories"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {t("categories.admin")}
              </button>
              <button
                onClick={() => onChangeTab("orders")}
                className={`px-4 py-2 text-sm ${
                  activePage === "orders"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {t("designManager.orders") || "Orders"}
              </button>
            </div>
          </div>
        </div>

        {/* Conditionally render Designs, Gallery or Categories */}
        {activePage === 'designs' && (
          <>
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search bar */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t("designManager.searchLabel") || "Search designs"}
                </label>

                <div className="relative">
                  {/* Search icon (inside input) */}
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  </span>

                  <input
                    type="text"
                    value={designSearch}
                    onChange={(e) => setDesignSearch(e.target.value)}
                    placeholder={
                      t("designManager.searchPlaceholder") ||
                      "Search by name or description"
                    }
                    className="w-full border rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                  />

                  {designSearch && (
                    <button
                      type="button"
                      onClick={() => setDesignSearch("")}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={t("designManager.clearSearch") || "Clear search"}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add-design button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAddDesign}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  {t("designManager.addNewDesign")}
                </button>
              </div>
            </div>

            {designList.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">
                {t("designManager.empty") || "No designs available."}
              </p>
            ) : filteredDesigns.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">
                {t("designManager.noSearchResults") || "No designs match your search."}
              </p>
            ) : (
              <div className="space-y-6">
                {filteredDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 min-w-0"
                  >
                    <div className="flex items-center">
                      <img
                        src={design.images[0] || "https://placehold.co/100x100?text=No+Image"}
                        alt={getLocalizedString(design.name)}
                        className="h-16 w-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="text-lg font-medium">
                          {highlightMatch(
                            getLocalizedString(design.name),
                            normalizedDesignSearch
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {highlightMatch(
                            getLocalizedString(
                              (design.description as any) ?? { en: "", lt: "" }
                            ),
                            normalizedDesignSearch
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("designs.catName")}:{" "}
                          {getLocalizedString((design.category as any)?.name ?? { en: "", lt: "" })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("designs.stockName")}: {design.stock}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("designs.priceName")}: {formatPrice(design.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditDesign(design.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button
                        onClick={() => askDelete(design.id, "design")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activePage === 'gallery' && (
          <>
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search bar – fills remaining width */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t("gallery.searchLabel") || "Search gallery"}
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  </span>

                  <input
                    type="text"
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    placeholder={
                      t("gallery.searchPlaceholder") || "Search by name or description"
                    }
                    className="w-full border rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                  />

                  {gallerySearch && (
                    <button
                      type="button"
                      onClick={() => setGallerySearch("")}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={t("gallery.clearSearch") || "Clear search"}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add-gallery button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAddGallery}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  {t("gallery.addNewGallery") || "Add a new gallery item"}
                </button>
              </div>
            </div>

            {galleryList.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">
                {t("gallery.empty") || "No gallery items available."}
              </p>
            ) : filteredGallery.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">
                {t("gallery.noSearchResults") || "No gallery items match your search."}
              </p>
            ) : (
              <div className="space-y-6">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 min-w-0"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.images[0] || "https://placehold.co/100x100?text=No+Image"}
                        alt={getLocalizedString(item.name)}
                        className="h-16 w-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="text-lg font-medium">
                          {highlightMatch(
                            getLocalizedString(item.name),
                            normalizedGallerySearch
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {highlightMatch(
                            getLocalizedString(
                              item.description ?? { en: "", lt: "" }
                            ),
                            normalizedGallerySearch
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditGallery(item.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button
                        onClick={() => askDelete(item.id, "gallery")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activePage === 'categories' && (
          <>
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search bar – fills remaining width */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t("categories.searchLabel") || "Search categories"}
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  </span>

                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder={
                      t("categories.searchPlaceholder") || "Search by name"
                    }
                    className="w-full border rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                  />

                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch("")}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={t("categories.clearSearch") || "Clear search"}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add-category button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  {t("categories.addNewCategory") || "Add a new category"}
                </button>
              </div>
            </div>

            {categoryList.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">
                {t("categories.empty") || "No categories available."}
              </p>
            ) : filteredCategories.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">
                {t("categories.noSearchResults") || "No categories match your search."}
              </p>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 min-w-0"
                  >
                    <div>
                      <p className="text-lg font-medium">
                        {highlightMatch(
                          getLocalizedString(cat.name),
                          normalizedCategorySearch
                        )}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditCategory(cat.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button
                        onClick={() => askDelete(cat.id, "category")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activePage === 'orders' && <OrdersPanel />}
      </div>
      <ConfirmDialog
        isOpen={!!confirm}
        title={t('confirmation.title')}
        message={t('confirmation.message')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default DesignManager;
