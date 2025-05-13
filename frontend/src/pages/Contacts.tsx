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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.27039352074!2d25.302886477909627!3d54.837114272759116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd9b004d51b55d%3A0xe9dd0dfe66b91173!2sUAB%20Mteam!5e1!3m2!1sen!2slt!4v1747131245848!5m2!1sen!2slt"
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
          {t('contacts.address')} <a href='https://maps.app.goo.gl/trhQzw6qmkWLk34s6' className='underline'>Briedžių g. 7, Pašiliai, Vilniaus r. sav.</a>
        </p>
      </div>
    </section>
  );
}
