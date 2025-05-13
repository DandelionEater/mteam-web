import React, { useState, useRef, useEffect } from 'react';
import DesignInfo from '../components/DesignInfo';
import { useTranslation } from 'react-i18next';
import { BaseDesign, DisplayDesign } from '../types';
import { designs } from '../data/designs';  // Import the designs here

const Designs: React.FC = () => {
  const { t } = useTranslation();

  const [selectedDesign, setSelectedDesign] = useState<DisplayDesign | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = Array.from(new Set(designs.map(design => design.categoryKey)));

  const filteredDesigns = selectedCategory
    ? designs.filter(design => design.categoryKey === selectedCategory)
    : designs;

  const handleSelectDesign = (design: BaseDesign) => {
    const { price, ...rest } = design;
    setSelectedDesign({ ...rest, price });
  };

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsMobileFilterOpen(false);
      }
    };
    if (isMobileFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileFilterOpen]);

  return (
    <section className="bg-white py-16 px-6 min-h-screen pt-24">
      <div className="w-full">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 text-center pt-4">
          {t('designs.title')}
        </h2>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4 flex justify-end">
        <button
          onClick={() => setIsMobileFilterOpen(prev => !prev)}
          className="px-4 py-2 border rounded-lg bg-gray-900 text-white w-full"
        >
          {t('categories.filter')}
        </button>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Filter Section */}
        <div
          ref={filterRef}
          className={`
            md:block md:w-1/4 bg-gray-100 p-4 rounded-lg
            ${isMobileFilterOpen ? 'block' : 'hidden'} md:block
          `}
        >
          <h3 className="text-xl font-semibold mb-4 text-center">
            {t('categories.filterByCategory')}
          </h3>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-200 transition ${selectedCategory === '' ? 'bg-gray-300' : ''}`}
              >
                {t('categories.all')}
              </button>
            </li>
            {categories.map((categoryKey, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    setSelectedCategory(categoryKey);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-200 transition ${selectedCategory === categoryKey ? 'bg-gray-300' : ''}`}
                >
                  {t(categoryKey)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Grid */}
        <div className="md:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design, index) => (
              <div
                key={index}
                onClick={() => handleSelectDesign(design)}
                className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
              >
                <img
                  src={design.images[0]}
                  alt={design.nameKey}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-bold">{t(design.nameKey)}</h3>
                  <p className="text-sm mt-2 px-4 text-center">{t(design.descriptionKey)}</p>
                  <p className="text-lg font-semibold mt-2">{design.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Design Info Modal */}
      <DesignInfo
        isOpen={!!selectedDesign}
        onClose={() => setSelectedDesign(null)}
        design={selectedDesign || {
          id: 0,
          nameKey: '',
          descriptionKey: '',
          price: 0,
          stock: 0,
          images: [],
          categoryKey: '',
          quantity: 0,
        }}
      />
    </section>
  );
};

export default Designs;
