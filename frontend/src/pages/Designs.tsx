import React, { useState } from 'react';
import DesignInfo from '../components/DesignInfo';

const designs = [
  {
    name: "Custom Bracket",
    description: "Precision CNC-milled steel bracket for industrial use.",
    price: "$120",
    image: "https://placehold.co/400x250",
  },
  {
    name: "Welded Frame",
    description: "Sturdy aluminum frame made for architectural projects.",
    price: "$220",
    image: "https://placehold.co/400x250",
  },
  {
    name: "Metal Sculpture",
    description: "Artistic piece combining industrial form with expression.",
    price: "$350",
    image: "https://placehold.co/400x250",
  },
];

const Designs: React.FC = () => {
  const [selectedDesign, setSelectedDesign] = useState<null | typeof designs[0]>(null);

  return (
    <section className="bg-white py-16 px-6 min-h-screen pt-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 text-center pt-4">
          Our Designs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design, index) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>

      <DesignInfo
        isOpen={!!selectedDesign}
        onClose={() => setSelectedDesign(null)}
        name={selectedDesign?.name || ''}
        description={selectedDesign?.description || ''}
        price={selectedDesign?.price || ''}
        image={selectedDesign?.image || ''}
      />
    </section>
  );
};

export default Designs;
