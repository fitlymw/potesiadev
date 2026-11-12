import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`,
    },

    supportedLngs: ['id', 'en'],
    // Treat regional codes such as id-ID or en-US as their base language
    load: 'languageOnly',
  });

export default i18n;

