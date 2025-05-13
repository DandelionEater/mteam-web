import React, { useState } from 'react';
import backgroundImage from '../assets/fph-image.jpg';
import CardOverlay from '../components/CardOverlay';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WrenchScrewdriverIcon, Cog6ToothIcon, LightBulbIcon, PuzzlePieceIcon, PencilIcon, CubeIcon } from '@heroicons/react/24/solid';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const [activeOverlay, setActiveOverlay] = useState<null | number>(null);

  const handleOverlayOpen = (index: number) => {
    setActiveOverlay(index);
  };

  const handleOverlayClose = () => {
    setActiveOverlay(null);
  };

  return (
    <>
      {/* Full-Page Header Section */}
      <section
        className="h-screen w-full bg-cover bg-center flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="bg-gray-300 bg-opacity-90 p-7 max-w-2x1">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-black mb-8">
            {t('home.heroSubtitle')}
          </p>
          <Link
            to="/designs"
            className="inline-block bg-gray-900 text-white px-6 py-3 text-sm hover:bg-gray-500 transition"
          >
            {t('home.viewDesigns')}
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <section id="about" className="w-full bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4">
          {t('home.whatWeDo')}
        </h2>
        <p className="text-black text-lg">
          {t('home.introText')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Card 1 */}
        <div 
          onClick={() => handleOverlayOpen(1)} 
          className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition transform hover:scale-105 duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <WrenchScrewdriverIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black text-center">{t('home.card1Title')}</h3>
          </div>
          <p className="text-black">
            {t('home.card1Description')}
          </p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => handleOverlayOpen(2)} 
          className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition transform hover:scale-105 duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <Cog6ToothIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">{t('home.card2Title')}</h3>
          </div>
          <p className="text-black">
            {t('home.card2Description')}
          </p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => handleOverlayOpen(3)} 
          className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition transform hover:scale-105 duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <LightBulbIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">{t('home.card3Title')}</h3>
          </div>
          <p className="text-black">
            {t('home.card3Description')}
          </p>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => handleOverlayOpen(4)} 
          className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition transform hover:scale-105 duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <PuzzlePieceIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">{t('home.card4Title')}</h3>
          </div>
          <p className="text-black">
            {t('home.card4Description')}
          </p>
        </div>

        {/* Card 5 */}
        <div 
          onClick={() => handleOverlayOpen(5)} 
          className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition transform hover:scale-105 duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <PencilIcon className="h-6 w-6 text-black p-1" />
            <h3 className="text-xl font-semibold text-black">{t('home.card5Title')}</h3>
          </div>
          <p className="text-black">
            {t('home.card5Description')}
          </p>
        </div>

        {/* Card 6 */}
        <div 
          onClick={() => handleOverlayOpen(6)} 
          className="bg-gray-300 p-6 rounded-tl-xl rounded-br-xl shadow-md hover:shadow-lg transition transform hover:scale-105 duration-300 ease-in-out cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <CubeIcon className="h-6 w-6 text-black p-1 " />
            <h3 className="text-xl font-semibold text-black">{t('home.card6Title')}</h3>
          </div>
          <p className="text-black">
            {t('home.card6Description')}
          </p>
        </div>
      </div>
    </section>
    <CardOverlay activeIndex={activeOverlay} onClose={handleOverlayClose} />
    </>
  );
};

export default Home;
