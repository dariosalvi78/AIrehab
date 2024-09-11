import { date } from 'quasar'
const { formatDate } = date

export default {
    formattedDate(date) {
        return formatDate(date, 'YYYY-MM-DD')
    }
}