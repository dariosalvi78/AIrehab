import { boot } from 'quasar/wrappers'
import { Lang as language } from 'quasar'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import storage from 'src/utils/storage'

export const i18n = createI18n({
  locale: storage.getItem('locale') || language.getLocale().split('T')[0],
  fallbackLocale: 'en',
  globalInjection: true,
  warnHtmlInMessage: "off",
  messages: {}
})
await mergeLocaleMessages(['common'])

/** @param {String[]} resources name of resources taken from i18n files */
export async function mergeLocaleMessages(resources) {
  const [l, _] = i18n.global.locale.split('-')
  let message = undefined

  for (const r of resources) {
    message = await import(`../i18n/${r}/${l}.js`)
    i18n.global.mergeLocaleMessage(l, { [r]: message.default })
  }
  return nextTick()
}

export async function updateI18nLocale(newLocale) {
  const old = i18n.global.locale
  const resourcesToLoad = Object.keys(i18n.global.messages[old])
  
  i18n.global.locale = newLocale
  await mergeLocaleMessages(resourcesToLoad)
}

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})