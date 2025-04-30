import { useTranslation } from 'react-i18next';

export default function Contacts() {
  const { t } = useTranslation();

  return (
    <section className="max-w-4xl mx-auto px-4 py-16 pt-32 bg-white">
      <h2 className="text-3xl font-bold text-center mb-10">{t('contacts.title')}</h2>

      {/* Contact Form */}
      <form className="grid gap-6 bg-gray-300 p-6 rounded-xl shadow-md mb-12">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            {t('contacts.emailLabel')}
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            {t('contacts.subjectLabel')}
          </label>
          <input
            type="text"
            id="title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-medium mb-1">
            {t('contacts.messageLabel')}
          </label>
          <textarea
            id="message"
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t('contacts.sendButton')}
        </button>
      </form>

      {/* Map */}
      <section className="mb-12">
        <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2317.4256492431464!2d25.397332776829348!3d54.70226407271354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd963edcd6be29%3A0xf1be29353afb7f5f!2sBried%C5%BEi%C5%B3%20g.%207%2C%20Vilnius%2C%2011105%20Vilniaus%20m.%20sav.!5e1!3m2!1sen!2slt!4v1746004725865!5m2!1sen!2slt"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* Company Contact Info */}
      <div className="bg-gray-300 p-6 rounded-xl shadow-md text-center mb-10">
        <h3 className="text-xl font-semibold mb-2">{t('contacts.infoTitle')}</h3>
        <p className="text-gray-700">
          {t('contacts.email')} <a href="mailto:genadij@mteam.lt" className="underline">genadij@mteam.lt</a>
        </p>
        <p className="text-gray-700">
          {t('contacts.phone')} <a href="tel:+37063333355" className="underline">+370 633 33355</a>
        </p>
        <p className="text-gray-700">
          {t('contacts.address')}
        </p>
      </div>
    </section>
  );
}
