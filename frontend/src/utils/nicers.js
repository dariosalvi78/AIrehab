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
    formattedDateLastLogin(date) {
        return formatDate(date, 'DD MMM HH:mm')
    },
    
    delay (ms) {
        return new Promise(res => setTimeout(res, ms))
    }
}