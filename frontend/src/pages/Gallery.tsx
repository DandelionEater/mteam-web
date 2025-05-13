import { useState } from 'react';
import { gallery } from '../data/gallery';
import GalleryInfo from '../components/GalleryInfo';
import { useTranslation } from 'react-i18next';

const Gallery = () => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<typeof gallery[0] | null>(null);

  return (
    <section className="bg-white py-16 px-6 min-h-screen pt-24">
      <div className="w-full">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 text-center pt-4">
          {t('gallery.title')}
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
          >
            <img
              src={item.images[0]}
              alt={t(item.nameKey)}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-xl font-bold text-center">{t(item.nameKey)}</h3>
              <p className="text-sm mt-2 px-4 text-center">{t(item.descriptionKey)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <GalleryInfo
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </section>
  );
};

export default Gallery;
