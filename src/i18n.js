import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import si from './locales/si.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si }
    },
    lng: localStorage.getItem('appLanguage') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

// Persist language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('appLanguage', lng);
});

export default i18n;
