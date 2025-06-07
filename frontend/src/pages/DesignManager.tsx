import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { DesignItem } from '../data/designs';
import { GalleryItem, LocalizedString } from '../data/gallery';
import { CategoriesItem } from '../data/categories';
import { fetchItems, deleteItem } from "../dbMiddleware/ItemCRUD";
import { fetchGalleryItems, deleteGalleryItem } from "../dbMiddleware/GalleryCRUD";
import { fetchCategories, deleteCategory } from "../dbMiddleware/CategoryCRUD";

const DesignManager = () => {
  const { t, i18n } = useTranslation();
  const [designList, setDesignList] = useState<DesignItem[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [categoryList, setCategoryList] = useState<CategoriesItem[]>([]);
  const [activePage, setActivePage] = useState<'designs' | 'gallery' | 'categories'>('designs');

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

  // Designs handlers
  const handleAddDesign = () => {
    navigate('/admin-manager/add');
  };
  const handleEditDesign = (id: string) => {
    navigate(`/admin-manager/edit/${id}`);
  };
  const handleRemoveDesign = async (id: string) => {
    try {
      await deleteItem(id);
      setDesignList((prev) => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // Gallery handlers
  const handleAddGallery = () => {
    navigate('/admin-manager/gallery/add');
  };
  const handleEditGallery = (id: string) => {
    navigate(`/admin-manager/gallery/edit/${id}`);
  };
  const handleRemoveGallery = async (id: string) => {
    try {
      await deleteGalleryItem(id);
      setGalleryList((prev) => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete gallery item:", error);
    }
  };

  // Categories handlers
  const handleAddCategory = () => {
    navigate('/admin-manager/category/add');
  };
  const handleEditCategory = (id: string) => {
    navigate(`/admin-manager/category/edit/${id}`);
  };
  const handleRemoveCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategoryList((prev) => prev.filter(cat => cat.id !== id && cat.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <h1 className="text-center text-3xl font-semibold mb-6">{t('designManager.title')}</h1>

        {/* Toggle between Designs, Gallery and Categories */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActivePage('designs')}
            className={`px-4 py-2 ${activePage === 'designs' ? 'bg-black text-white' : 'bg-gray-200'} rounded-l`}
          >
            {t('nav.designs')}
          </button>
          <button
            onClick={() => setActivePage('gallery')}
            className={`px-4 py-2 ${activePage === 'gallery' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            {t('nav.gallery')}
          </button>
          <button
            onClick={() => setActivePage('categories')}
            className={`px-4 py-2 ${activePage === 'categories' ? 'bg-black text-white' : 'bg-gray-200'} rounded-r`}
          >
            {t('categories.admin')}
          </button>
        </div>

        {/* Conditionally render Designs, Gallery or Categories */}
        {activePage === 'designs' && (
          <>
            <div className="mb-8 bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <button
                onClick={handleAddDesign}
                className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-center"
              >
                {t('designManager.addNewDesign')}
              </button>
            </div>

            {designList.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">{t('designManager.empty') || 'No designs available.'}</p>
            ) : (
              <div className="space-y-6">
                {designList.map((design) => (
                  <div key={design.id} className="flex items-center justify-between bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center">
                      <img
                        src={design.images[0] || 'https://placehold.co/100x100?text=No+Image'}
                        alt={getLocalizedString(design.name)}
                        className="h-16 w-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="text-lg font-medium">{getLocalizedString(design.name)}</p>
                        <p className="text-sm text-gray-500">{getLocalizedString(design.description ?? { en: '', lt: '' })}</p>
                        <p className="text-sm text-gray-500">{t('designs.catName')}: {getLocalizedString((design.category as any)?.name ?? { en: '', lt: '' })}</p>
                        <p className="text-sm text-gray-500">{t('designs.stockName')}: {design.stock}</p>
                        <p className="text-sm text-gray-500">{t('designs.priceName')}: {formatPrice(design.price)}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditDesign(design.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveDesign(design.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
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
            <div className="mb-8 bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <button
                onClick={handleAddGallery}
                className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-center"
              >
                {t('gallery.addNewGallery') || 'Add a new gallery item'}
              </button>
            </div>

            {galleryList.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">{t('gallery.empty') || 'No gallery items available.'}</p>
            ) : (
              <div className="space-y-6">
                {galleryList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center">
                      <img
                        src={item.images[0] || 'https://placehold.co/100x100?text=No+Image'}
                        alt={getLocalizedString(item.name)}
                        className="h-16 w-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="text-lg font-medium">{getLocalizedString(item.name)}</p>
                        <p className="text-sm text-gray-500">{getLocalizedString(item.description)}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditGallery(item.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveGallery(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
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
            <div className="mb-8 bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <button
                onClick={handleAddCategory}
                className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-center"
              >
                {t('categories.addNewCategory') || 'Add a new category'}
              </button>
            </div>

            {categoryList.length === 0 ? (
              <p className="text-center text-lg text-gray-500 pt-6">{t('categories.empty') || 'No categories available.'}</p>
            ) : (
              <div className="space-y-6">
                {categoryList.map((cat) => (
                  <div key={cat.id || cat.id} className="flex items-center justify-between bg-white shadow-md rounded-lg p-4">
                    <div>
                      <p className="text-lg font-medium">{getLocalizedString(cat.name)}</p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditCategory(cat.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveCategory(cat.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DesignManager;
