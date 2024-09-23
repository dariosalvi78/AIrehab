import { date } from 'quasar'
const { formatDate } = date

export default {
    /**
    * @returns Date with format: YYYY-MM-DD
    */
    formattedDate(date) {
        return formatDate(date, 'YYYY-MM-DD')
    },
    /**
    * @returns Date with format: MMM-DD HH:MM
    */
    formattedDayOfMonth(date) {
        return formatDate(date, 'DD MMM HH:mm')
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
    }
}