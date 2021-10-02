import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { en } from './en'
import { zh_CN } from './zh_CN'

const resources = {
  'zh-CN': {
    translation: zh_CN
  },
  en: {
    translation: en
  }
}
console.log("🚀 ~ file: i18n.js ~ line 15 ~ resources", resources)

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    // 如果用户选择的语言不被支持，那么使用英文来渲染界面
    // fallbackLng: ['zh-CN', 'en'],
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    load: 'all',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  })

export default i18n
