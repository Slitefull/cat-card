import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uk from './locales/uk.json'

export const languages = { en: 'English', uk: 'Українська', ru: 'Русский' }

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en }
  }
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng
})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk satisfies typeof en },
      ru: { translation: ru satisfies typeof en },
    },
    supportedLngs: Object.keys(languages),
    fallbackLng: 'en',
    detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: 'lang', caches: ['localStorage'] },
    interpolation: { escapeValue: false },
    initAsync: false,
  })

export default i18n
