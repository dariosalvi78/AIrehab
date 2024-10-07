
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
        host: config.mailer.host,
        port: config.mailer.port,
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
        Account created details\n
        Email: ${recipient}\n
        Password: ${password}
      `
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