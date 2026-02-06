import { i18n } from 'src/boot/i18n'
import password_strength from 'zxcvbn'

const MIN_PASSWORD_LENGTH = 8,
  MIN_SCORE = 2

/**
 * Module for testing password strength using zxcvbn
 */
export default {
  /**
   * @param {String} password 
   * @description 8 characters in length, one upper- lowercase letter, one digit, one special character.
   * @returns feedback if password does not pass, otherwise return nothing
   */
  checkPwdStrength(password) {
    if (
      !password
      || password.length < MIN_PASSWORD_LENGTH
      || !password.match(/^(?=.*?[A-ZÅÄÖ])(?=.*?[a-zåäö])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._]).{8,}$/gm)
    ) return i18n.global.t('common.new_user.form.password_error')

    const strength = password_strength(password)
    if (strength.feedback.warning || strength.score < MIN_SCORE) {
      return `
        ${zxcvbnTokens(strength.feedback.warning)}
        ${strength.feedback.suggestions.length ? `${i18n.global.t('common.new_user.suggestion')}` : ''}
      `
    }
  },
  getPwdFeedback(password) {
    if (!password) return ''
    let pwdHint = '', pwd_score = undefined
    let checkStrength = password_strength(password)

    pwd_score = checkStrength.score
    if (pwd_score >= 2 && pwd_score < 4) pwdHint = `· ${i18n.global.t('common.new_user.password_check.score.medium')}`
    else if (pwd_score >= 4) pwdHint = `· ${i18n.global.t('common.new_user.password_check.score.high')}`
    return pwdHint
  }
}

/** @param {String} warning */
function zxcvbnTokens(warning) {
  let match = 'lowScore'
  if (warning.indexOf('This is a very common password') !== -1) match = 'common'
  else if (warning.indexOf('This is similar to a commonly used password') !== -1) match = 'similarCommon'
  else if (warning.indexOf('Repeats like "abcabcabc"') !== -1) match = 'repeated'
  else if (warning.indexOf('Common names and surnames are easy to guess') !== -1) match = 'commonNames'
  
  return i18n.global.t(`common.new_user.password_check.warnings.${match}`)
}