import React, { useState } from 'react';
import DesignInfo from '../components/DesignInfo';
import { useTranslation } from 'react-i18next';

const Designs: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDesign, setSelectedDesign] = useState<null | typeof designs[0]>(null);
  const [cart, setCart] = useState<Array<typeof designs[0]>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Track selected category

  const designs = [
    {
      id: 0,
      name: t('designs.card1.name'),
      description: t('designs.card1.description'),
      price: t('designs.card1.price'),
      stock: 5,
      image: "https://placehold.co/400x250",
      category: t('categories.chair'),
    },
    {
      id: 1,
      name: t('designs.card2.name'),
      description: t('designs.card2.description'),
      price: t('designs.card2.price'),
      stock: 10,
      image: "https://placehold.co/400x250",
      category: t('categories.table'),
    },
    {
      id: 2,
      name: t('designs.card3.name'),
      description: t('designs.card3.description'),
      price: t('designs.card3.price'),
      stock: 3,
      image: "https://placehold.co/400x250",
      category: t('categories.bench'),
    },
  ];

  const categories = Array.from(new Set(designs.map(design => design.category)));

  // Add to cart functionality
  const addToCart = (design: { id: number; name: string; description: string; price: string; stock: number; image: string; category: string }) => {
    setCart((prevCart) => [...prevCart, design]);
  };

  // Filter designs based on selected category
  const filteredDesigns = selectedCategory
    ? designs.filter(design => design.category === selectedCategory)
    : designs;

  return (
    <section className="bg-white py-16 px-6 min-h-screen pt-24">
      <div className="w-full">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 text-center pt-4">
          {t('designs.title')}
        </h2>
      </div>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar Filter */}
        <div className="w-1/4 bg-gray-100 p-4 rounded-lg mr-6">
          <h3 className="text-xl font-semibold mb-4 text-center">{t('categories.filterByCategory')}</h3>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-200 transition ${selectedCategory === '' ? 'bg-gray-300' : ''}`}
              >
                {t('categories.all')}
              </button>
            </li>
            {categories.map((category, index) => (
              <li key={index}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-200 transition ${selectedCategory === category ? 'bg-gray-300' : ''}`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Grid */}
        <div className="w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design, index) => (
              <div
                key={index}
                onClick={() => setSelectedDesign(design)}
                className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
              >
                <img
                  src={design.image}
                  alt={design.name}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-bold">{design.name}</h3>
                  <p className="text-sm mt-2 px-4 text-center">{design.description}</p>
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
        design={selectedDesign || { id: 0, name: '', description: '', price: '', stock: 0, image: '', category: '' }}
        onAddToCart={addToCart}
      />
    </section>
  );
};

export default Designs;
