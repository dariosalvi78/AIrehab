
/**
 * This module is used for sending and receiving email
 * emails are mocked during development
 */

import nodemailer from 'nodemailer'
import config from '../config.js'
import logger from '../logger.js'
import { renderFile } from 'ejs'

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
   * Send invitation email to new physiotherapist
   * @param {String} recipient 
   * @param {String} invitationToken 
   */
  sendPhysiotherapistInvitation: async (recipient, invitationToken) => {
    const template = await renderFile(import.meta.dirname + '/views/welcome.ejs', { recipient, domain, invitationToken })
    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Nytt konto • Välkommen till POE Assessment',
      html: template,
      attachDataUrls: true
    }
    await sendEmail(options)
  },
  sendPhysiotherapistPasswordReset: async (recipient, resetToken) => {
    const template = await renderFile(import.meta.dirname + '/views/passwordReset.ejs', { domain, resetToken, recipient })
    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Återställ lösenord • POE Assessment',
      html: template,
      attachDataUrls: true
    }
    await sendEmail(options)
  },
  sendPatientAccessLink: async (recipient, patientID, accessToken) => {
    const template = await renderFile(import.meta.dirname + '/views/patientAccess.ejs', { domain, patientID, accessToken })
    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Din personliga sida • POE Assessment',
      html: template,
      attachDataUrls: true
    }
    await sendEmail(options)
  },
  sendPhysiotherapistPOEResults: async (recipient, meta, sessionID, exerciseID) => {
    const template = await renderFile(import.meta.dirname + '/views/poeAvailable.ejs', { domain, exerciseType: meta.typeAsc, sessionID, exerciseID })
    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: `Övningsresultat ${meta.date} • POE Assessment`,
      html: template,
      attachDataUrls: true
    }
    await sendEmail(options)
  },
  sendPhysiotherapistSurveyAvailable: async (recipient) => {
    const template = await renderFile(import.meta.dirname + '/views/newSurvey.ejs', { domain })
    const options = {
      from: config.mailer.from_address,
      to: recipient,
      subject: 'Påminnelse om enkät • POE Assessment',
      html: template,
      attachDataUrls: true
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