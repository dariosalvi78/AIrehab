import password_strength from 'zxcvbn'

/**
 * Module for testing password strength using zxcvbn
 */
export default {
    checkPwdStrength (password) {
        if (password) {
            let checkStrength = password_strength(password)
            if (checkStrength.feedback.warning) {
                for (let pwd in checkStrength.feedback.suggestions) {
                    return `
                        ${checkStrength.feedback.warning}
                        ${checkStrength.feedback.suggestions[pwd]}
                        `
                }
            }
        }
    },
    getPwdFeedback (password) {
        if (!password) return ''

        let pwdHint = '', pwd_score = undefined
        let checkStrength = password_strength(password)

        pwd_score = checkStrength.score
        if (pwd_score >= 2 && pwd_score < 4) pwdHint = '· OK password'
        else if (pwd_score >= 4) pwdHint = '· Good password'
        return pwdHint
    }
}