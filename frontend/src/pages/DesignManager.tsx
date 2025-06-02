import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseDesign } from '../types';
import { designs } from '../data/designs';
import { gallery, GalleryItem } from '../data/gallery';

const DesignManager = () => {
  const { t, i18n } = useTranslation();
  const [designList, setDesignList] = useState<BaseDesign[]>(designs);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(gallery);
  const [activePage, setActivePage] = useState<'designs' | 'gallery'>('designs');

  const navigate = useNavigate();

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

  // Design handlers
  const handleRemoveDesign = (id: number) => {
    setDesignList(designList.filter((design) => design.id !== id));
  };
  const handleAddDesign = () => {
    navigate('/admin-manager/add');
  };
  const handleEditDesign = (id: number) => {
    navigate(`/admin-manager/edit/${id}`);
  };

  // Gallery handlers
  const handleRemoveGallery = (id: number) => {
    setGalleryList(galleryList.filter((item) => item.id !== id));
  };
  const handleAddGallery = () => {
    navigate('/admin-manager/gallery/add');
  };
  const handleEditGallery = (id: number) => {
    navigate(`/admin-manager/gallery/edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <h1 className="text-center text-3xl font-semibold mb-6">{t('designManager.title')}</h1>

        {/* Toggle between Designs and Gallery */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActivePage('designs')}
            className={`px-4 py-2 ${activePage === 'designs' ? 'bg-black text-white' : 'bg-gray-200'} rounded-l`}
          >
            {t('nav.designs')}
          </button>
          <button
            onClick={() => setActivePage('gallery')}
            className={`px-4 py-2 ${activePage === 'gallery' ? 'bg-black text-white' : 'bg-gray-200'} rounded-r`}
          >
            {t('nav.gallery')}
          </button>
        </div>

        {/* Conditionally render Designs or Gallery */}
        {activePage === 'designs' ? (
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
                      <img src={design.images[0] || 'https://placehold.co/100x100?text=No+Image'} alt={t(design.nameKey)} className="h-16 w-16 object-cover rounded-md mr-4" />
                      <div>
                        <p className="text-lg font-medium">{t(design.nameKey)}</p>
                        <p className="text-sm text-gray-500">{t(design.descriptionKey)}</p>
                        <p className="text-sm text-gray-500">{t('designs.catName')}: {t(design.categoryKey)}</p>
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
        ) : (
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
                      <img src={item.images[0] || 'https://placehold.co/100x100?text=No+Image'} alt={t(item.nameKey)} className="h-16 w-16 object-cover rounded-md mr-4" />
                      <div>
                        <p className="text-lg font-medium">{t(item.nameKey)}</p>
                        <p className="text-sm text-gray-500">{t(item.descriptionKey)}</p>
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
      </div>
    </div>
  );
};

export default DesignManager;
