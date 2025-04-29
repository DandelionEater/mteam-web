import React from 'react';
import backgroundImage from '../assets/fph-image.jpg';
import { Link } from 'react-router-dom';
import { WrenchScrewdriverIcon, Cog6ToothIcon, LightBulbIcon, PuzzlePieceIcon, PencilIcon, CubeIcon } from '@heroicons/react/24/solid';

const Home: React.FC = () => {
  return (
    <>
      {/* Full-Page Hero Section */}
      <section
        className="h-screen w-full bg-cover bg-center flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="bg-gray-300 bg-opacity-90 p-7 max-w-2x1">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
            Welcome to MTEAM
          </h1>
          <p className="text-lg md:text-xl text-black mb-8">
            Innovative solutions. Professional results.
          </p>
          <Link
            to="/designs"
            className="inline-block bg-gray-900 text-white px-6 py-3 text-sm hover:bg-gray-500 transition"
          >
            Our Designs
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <section id="about" className="w-full bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4">
          What We Do
        </h2>
        <p className="text-black text-lg">
          MTEAM blends precision and craftsmanship to shape the future of metalwork — one part, weld or prototype at a time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Card 1 */}
        <div className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center gap-2 mb-2">
            <WrenchScrewdriverIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black text-center">CNC Machining</h3>
          </div>
          <p className="text-black">
            High-precision CNC milling and turning for custom metal parts with industrial accuracy.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center gap-2 mb-2">
            <Cog6ToothIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">Welding Services</h3>
          </div>
          <p className="text-black">
            Structural and detailed welding using modern techniques to ensure durability and clean aesthetics.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center gap-2 mb-2">
            <LightBulbIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">Prototyping</h3>
          </div>
          <p className="text-black">
            Got a weird idea? We'll bring it to life in metal, no matter how odd it sounds.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center gap-2 mb-2">
            <PuzzlePieceIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">Small Batch Production</h3>
          </div>
          <p className="text-black">
            Need 5 parts, not 5,000? We've got you covered with flexible production runs.
          </p>
        </div>

        {/* Card 5 */}
        <div className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center gap-2 mb-2">
            <PencilIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">Design Consultation</h3>
          </div>
          <p className="text-black">
            We'll help you refine your concept before it hits the machines.
          </p>
        </div>

        {/* Card 6 */}
        <div className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center gap-2 mb-2">
            <CubeIcon className="h-6 w-6 text-black p-1 " />
            <h3 className="text-xl font-semibold text-black">Custom Fabrication</h3>
          </div>
          <p className="text-black">
            Whether it's an art piece or an industrial frame, we'll build it from scratch.
          </p>
        </div>
      </div>
    </section>
    </>
  );
};

export default Home;
