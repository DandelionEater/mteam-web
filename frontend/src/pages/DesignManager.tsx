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
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../components/ToastContext';

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
  
  const params = new URLSearchParams(location.search);
  const tabParam = params.get('tab') as 'designs' | 'gallery' | 'categories' | null;
  const defaultTab: 'designs' | 'gallery' | 'categories' = tabParam || 'designs';

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

  // Sub-page loader
  useEffect(() => {
    if (tabParam && tabParam !== activePage) {
      setActivePage(tabParam);
    }
  }, [tabParam]);

  const onChangeTab = (page: 'designs' | 'gallery' | 'categories') => {
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
    }
  };

  const cancelDelete = () => setConfirm(null);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <h1 className="text-center text-3xl font-semibold mb-6">{t('designManager.title')}</h1>

        {/* Toggle between Designs, Gallery and Categories */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => onChangeTab('designs')}
            className={`px-4 py-2 ${activePage === 'designs' ? 'bg-black text-white' : 'bg-gray-200'} rounded-l`}
          >
            {t('nav.designs')}
          </button>
          <button
            onClick={() => onChangeTab('gallery')}
            className={`px-4 py-2 ${activePage === 'gallery' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            {t('nav.gallery')}
          </button>
          <button
            onClick={() => onChangeTab('categories')}
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
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button
                        onClick={() => askDelete(design.id, 'design')}
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
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button
                        onClick={() => askDelete(item.id, 'gallery')}
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
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button
                        onClick={() => askDelete(cat.id, 'category')}
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
