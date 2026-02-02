import { date, Notify } from 'quasar'
const { formatDate } = date
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/sv.js'
import 'dayjs/locale/en.js'

dayjs.extend(utc)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
const dateFormatter = dayjs

export default {
    /** @param {String} newLocale new locale from i18n */
    async updateLocale (newLocale) {
        if (!newLocale || newLocale && typeof newLocale !== 'string') return
        return dateFormatter.locale(newLocale)
    },
    /**
     * @param {Date} date
     * @returns Localized date with initial format: YYYY-MM-DD
    */
    formattedDate (date) {
        if (!date) return
        return dateFormatter.utc(date).format('L')
    },

    /** 
     * @param {Date} date
     * @returns Localized date with initial format: DD MMM HH:mm
    */
    formattedDayOfMonth (date) {
        if (!date) return
        return dateFormatter.utc(date).format('D MMM LT')
    },

    
    /** 
     * @param {Date} date
     * @returns Localized date from now
    */
    formattedDateFromNow (date) {
        if (!date) return
        return dateFormatter.utc(date).fromNow()
    },

    /**
     * @param {String} qDate
     * @param {'exercise' | 'patient'} form 
     * @returns {Boolean}
     */
    formDatetimeValidation (qDate, form) {
        let selectedDate = formatDate(qDate)
        let currDate = new Date().toISOString().slice(0, 10)
        if (form == 'exercise') {
            let maxDate = date.addToDate(currDate, { months: 3 }).toISOString()
            return (selectedDate >= currDate && selectedDate < maxDate)
        } else if (form == 'patient') {
            return (selectedDate <= currDate)
        }
        return (selectedDate <= currDate)
    },
    
    delay (ms) {
        return new Promise(res => setTimeout(res, ms))
    },
    
    /**
     * @param {String} value any type of text to copy
     */
    async copyTextToClipboard (value) {
        const clipboard = window.navigator.clipboard
        await clipboard.writeText(value)

        Notify.create({
            color: 'info',
            position: 'top',
            message: 'Verification link copied to clipboard',
            icon: 'info'
        })
        return
    }
}