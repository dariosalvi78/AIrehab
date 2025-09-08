import { boot } from 'quasar/wrappers'
import { Lang as language } from 'quasar'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export const i18n = createI18n({
    locale: language.getLocale(),
    fallbackLocale: 'en',
    globalInjection: true,
    warnHtmlInMessage: "off",
    messages: messages
})

export default boot(({ app }) => {
    // Set i18n instance on app
    app.use(i18n)
})