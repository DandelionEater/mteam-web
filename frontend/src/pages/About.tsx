import { useTranslation } from 'react-i18next';
import aboutImage from '../assets/about-image.jpg';
import { BriefcaseIcon, TruckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white text-gray-800 min-h-screen p-6 md:p-12">
      <section className="max-w-5xl mx-auto text-center mb-16 pt-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about.heroTitle')}</h1>
        <p className="text-lg md:text-xl text-gray-600">
          {t('about.heroText.part1')} <span className="font-semibold text-gray-900">MTEAM</span>, {t('about.heroText.part2')}
        </p>
      </section>

      <section className="mb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-4">
          <img
            src={aboutImage}
            alt={t('about.imageAlt')}
            className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
          />
          <div>
            <h2 className="text-2xl font-semibold mb-4">{t('about.whoTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('about.whoText1')}</p>
            <p className="text-gray-700">{t('about.whoText2')}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-20">
        <div className="bg-gray-300 p-6 rounded-xl shadow-md">
          <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-800 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('about.feature1.title')}</h3>
          <p className="text-gray-600">{t('about.feature1.text')}</p>
        </div>
        <div className="bg-gray-300 p-6 rounded-xl shadow-md">
          <TruckIcon className="w-12 h-12 mx-auto text-gray-800 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('about.feature2.title')}</h3>
          <p className="text-gray-600">{t('about.feature2.text')}</p>
        </div>
        <div className="bg-gray-300 p-6 rounded-xl shadow-md">
          <GlobeAltIcon className="w-12 h-12 mx-auto text-gray-800 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('about.feature3.title')}</h3>
          <p className="text-gray-600">{t('about.feature3.text')}</p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">{t('about.ctaTitle')}</h2>
        <p className="mb-6 text-gray-600">{t('about.ctaText')}</p>
        <button className="bg-gray-800 text-white px-6 py-3 hover:bg-gray-700 transition shadow-xl">
          {t('about.contactButton')}
        </button>
      </section>
    </div>
  );
};

export default About;
