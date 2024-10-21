
/**
 * This module is used for sending and receiving email
 * emails are mocked during development
 */

import nodemailer from 'nodemailer'
import config from './config.js'
import logger from './logger.js'

let transport_config = undefined

export default {

  init: async () => {
    logger.debug('Setting up mailer')
    await nodemailer.createTestAccount((err, account) => {
      if (err) logger.error(`failed to create test email: ${err}`)
      transport_config = {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: account.user,
          pass: account.pass
        }
      }
    })
  },

  /**
   * Send email to new physiotherapist with login details
   * @param {String} recipient 
   * @param {String} password 
   */
  sendPhysiotherapistEmailCreated: async (recipient, password) => {

    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Account created',
      html: `
        Account created details<br/>
        Email: ${recipient}<br/>
        Password: ${password}
      `
    }

    await sendEmail(options)
  },
  sendPhysiotherapistPasswordReset: async (recipient, token) => {

    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Password reset',
      html: `
        You have requested a new password<br/>
        Proceed to this <a href="http://${config.domain}:9000/resetpassword?token=${token}&email=${recipient}">link</a>
      `
    }

    await sendEmail(options)
  },
  /**
   * Send custom email
   * @param {String} recipient
   * @param {String} subject
   * @param {String} content
   */
  send: async (recipient, subject, content) => {

    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: subject,
      html: content
    }

    await sendEmail(options)
  }
}

const sendEmail = async (options) => {
  const smtp_transport = nodemailer.createTransport(transport_config)

  return new Promise(async (resolve, reject) => {
    try {
      let response = await smtp_transport.sendMail(options)
      if (config.environment == 'dev') console.log('sent email: ', nodemailer.getTestMessageUrl(response))

      if (response) {
        logger.info({ data: { from: response.envelope.from, to: response.envelope.to[0], subject: options.subject } }, 'sent email')
        return resolve(response)
      }
    } catch (err) {
      return reject(err)
    }
  })
}