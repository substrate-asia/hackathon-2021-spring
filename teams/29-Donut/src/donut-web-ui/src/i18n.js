import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { LOCALE_KEY } from './config.js'

Vue.use(VueI18n)

const DEFAULT_LANG = navigator.language
console.log('default language', DEFAULT_LANG)

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    zh: require('./assets/lang/zh_CN'),
    en: require('./assets/lang/EN'),
    kr: require('./assets/lang/KR'),
    es: require('./assets/lang/ES'),
    my: require('./assets/lang/MY'),
    jp: require('./assets/lang/JP')
  },
  fallbackLocale: 'en',
  silentFallbackWarn: true
})

const setup = lang => {
  if (lang === undefined) {
    lang = window.localStorage.getItem(LOCALE_KEY)
    if (i18n.messages[lang] === undefined) {
      lang = DEFAULT_LANG
    }
  }
  window.localStorage.setItem(LOCALE_KEY, lang)
  Object.keys(i18n.messages).forEach(lang => {
    document.body.classList.remove(`lang-${lang}`)
  })
  document.body.classList.add(`lang-${lang}`)
  document.body.setAttribute('lang', lang)

  Vue.config.lang = lang
  i18n.locale = lang
}

setup()

export default i18n
