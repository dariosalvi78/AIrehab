
/**
 * This module is used for sending and receiving email
 * emails are mocked during development
 */

import nodemailer from 'nodemailer'
import config from './config.js'
import logger from './logger.js'

let transport_config = undefined
let domain = undefined

export default {

  init: async () => {
    logger.debug('Setting up mailer')
    try {
      if (config.environment === 'dev') {
        await nodemailer.createTestAccount((err, account) => {
          if (err) return logger.error(`failed to create test email: ${err}`)
          transport_config = {
            host: config.mailer.host,
            port: config.mailer.port,
            auth: {
              user: account.user,
              pass: account.pass
            }
          }
        })
        domain = `http://${config.domain}:9000`
      } else {
        transport_config = {
          host: config.mailer.host, // mail server host
          port: config.mailer.port, // 587 if "secure" false 
          secure: false, // TLS, false will default to starttls
          auth: {
            user: config.mailer.smtp_user,
            pass: config.mailer.smtp_password
          }
        }
        domain = `https://${config.domain}`
      }    
    } catch (err) {
      logger.debug({ error: err }, 'cannot start mailer: ')
      return
    }
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
      subject: 'Account created • POE Assessment',
      html: `
        Account created details:
        <br/>
        <br/>
        Email: ${recipient}</br>
        Password: ${password}
        <br/>
        <br/>
        Visit this <a href="${domain}/login">link</a> to login
      `
    }

    await sendEmail(options)
  },
  sendPhysiotherapistPasswordReset: async (recipient, resetToken) => {

    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Password reset • POE Assessment',
      html: `
        You have requested a new password
        <br/>
        <br/>
        Proceed to this <a href="${domain}/resetpassword?token=${resetToken}&email=${recipient}">link</a>
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