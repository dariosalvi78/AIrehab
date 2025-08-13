import { date, Notify } from 'quasar'
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
    },

    formattedPosturalOrientation (orientation) {
        if (orientation == 'femoralValgus') {
            return 'Femoral valgus'
        } else if (orientation == 'trunk') {
            return 'Trunk'
        } else if (orientation == 'hip') {
            return 'Pelvis'
        } else if (orientation == 'kneeMedialToFootPosition') {
            return 'Knee medial to foot position'
        } else if (orientation == 'femurMedialToShank') {
            return 'Femur medial to shank'
        } else return 'Unknown'
    },

    formattedScoreToText(point) {
        let scores = [{ point: 0, text: 'Good', }, { point: 1, text: 'Fair' }, { point: 2, text: 'Poor' }]
        for (const score in scores) {
            if (scores[score].point == point) return scores[score].text
        }
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