import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { id } from './locales/id'

void i18n.use(initReactI18next).init({
  fallbackLng: 'id',
  interpolation: {
    escapeValue: false,
  },
  lng: 'id',
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
})

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

document.documentElement.lang = i18n.language

export default i18n
