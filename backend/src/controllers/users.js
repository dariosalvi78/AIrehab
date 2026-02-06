
import * as Types from '../datamodel/modeljdocs.mjs'
import bcrypt from 'bcrypt'
import { signAccessToken, signResetPwdToken, verifyAuthToken, session_cookie, signInvitationToken } from "../utils/tokenAuth.js"
import users from "../DOM/usersCollection.js"
import physiotherapist from "../DOM/physiotherapistCollection.js"
import logger from "../utils/logger.js"
import mailer from '../utils/mailer/mailer.js'
import scheduler from '../utils/scheduler.js'

export default {
    /**
     * Login user, checks if user has valid credentials
     * @param {Object} req - express request
     * @param {Object} req.body user data
     * @param {Object} res - express response
     * @returns {Promise<Types.User>}
    */
    login: async (req, res) => {
        if (!req.body.email || !req.body.password) return res.sendStatus(400)
        try {
            const user = await users.getUserByEmail(req.body.email)

            if (!user) return res.sendStatus(404)

            if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
                // user OK, continue
                await users.updateUserLoginTimestamp(user.id)
                delete user.id
                delete user.hashedPassword
                delete user.createdTimestamp
                delete user.lastLoginTimestamp

                logger.debug({ data: user }, 'user logged in')
                const token = await signAccessToken(user)
                res.cookie(session_cookie.name, token, session_cookie.options)
                return res.send({ user })
            } else {
                res.sendStatus(404)
                return
            }
        } catch (err) {
            logger.error({ error: err }, 'error user login: ')
            res.sendStatus(500)
            return
        }
    },
    /**
     * Log out user, removes token auth
     * @param {Object} req - express request
     * @param {Object} res - express response
     */
    logout: async (req, res) => {
        try {
            if (req.user) {
                logger.info('user logged out: ', req.user)
            }
            res.clearCookie(session_cookie.name, session_cookie.options)
            return res.sendStatus(204)
        } catch (err) {
            return res.status(500).send('Cannot log out ' + req.user.email)
        }
    },
    /**
     * Get all users
     * @param {Object} req - express request
     * @param {Object} res - express response
     * @returns {Promise<Array<Types.User>>}
     */
    getUsers: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        try {
            const results = await users.getUsers()
            res.send(results)
        } catch (err) {
            logger.error({ error: err }, 'error getting users')
            res.sendStatus(500)
            return
        }
    },
    /**
     * Get one user
     * @param {Object} req - express request
     * @param {Object} req.params - userID
     * @param {Object} res - express response
     * @returns {Promise<Types.User>}
     */
    getUser: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        try {
            const user = await users.getOneUser(req.params.userID)
            return res.send(user)
        } catch (err) {
            logger.error({ error: err }, 'error getting user')
            res.sendStatus(500)
            return
        }
    },

    // TODO: let user complete registration using email
    /**
     * Add one new user (physiotherapist)
     * @param {Object} req - express request
     * @param {Object} req.body - new user data
     * @param {Object} res - express response
     * @returns {Promise<Types.User>} added user
     */
    addNewUser: async (req, res) => {
        if (!req.body) return res.sendStatus(403)
        let body = req.body

        if (!body.token || !body.role || !body.email || !body.password) {
            res.sendStatus(400)
            return
        }

        const isUser = await users.getUserByEmail(body.email)
        if (isUser) return res.sendStatus(410)

        try {
            const data_decoded = await verifyAuthToken(body.token),
                email = data_decoded.email
            if (email !== body.email) return res.sendStatus(410) 

            let hash = bcrypt.hashSync(body.password, 8)
            const user = await users.createUser(email, hash, body.role)
            logger.info({ data: user }, 'new user created: ')

            const token = await signAccessToken(user)
            res.cookie(session_cookie.name, token, session_cookie.options)
            return res.status(201).json({ status: 'created', user })
        }
        catch (err) {
            if ((err.expiredAt * 1000) >= new Date().getTime()) {
                logger.error({ ...err, email: body.email }, 'user invitation expired:')
                return res.sendStatus(410)
            }
            logger.error({ error: err }, 'something went wrong when adding user')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Delete one user
     * @param {Object} req - express request
     * @param {Object} req.params - userID
     * @param {Object} res - express response
     */
    deleteUser: async (req, res) => {
        if (req.user.role !== 'admin') return res.sendStatus(403)
        let userID = req.params.userID
        try {
            let therapist = await users.getOneUser(userID)
            let results = await physiotherapist.getOneTherapistByEmail(therapist.email)
            delete results.hashedpassword

            if (results.numOfPatients >= 1) {
                res.status(409).send('user is assigned with patients')
                return
            }

            await users.deleteOneUser(userID)
            logger.info(`Deleted ${userID} permanently`)
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting user: ')
            res.sendStatus(500)
            return
        }
    },

    sendUserInvitationEmail: async (req, res) => {
        if (req.user.role !== 'admin') return res.sendStatus(403)
        let email = req.body.email
        try {
            const isUser = await users.getUserByEmail(email)
            if (isUser) return res.sendStatus(409)

            const token = await signInvitationToken(email)
            await mailer.sendPhysiotherapistInvitation(email, token)
            logger.debug({ 
                email: email,
                sent_at: new Date().toISOString()
            }, 'sent invitation to user')
            return res.send({ data: { email } })
        } catch (err) {
            logger.error({ error: err }, 'error sending invitation email: ')
            res.sendStatus(500)
            return
        }
    },

    sendEmail: async (req, res) => {
        if (req.user.role !== 'admin') return res.sendStatus(403)
        const { email, subject, content } = req.body
        try {
            const user = await users.getUserByEmail(email)
            if (!user) return res.sendStatus(404)

            await mailer.send(email, subject, content)
            return res.sendStatus(200)
        } catch (err) {
            logger.error({ error: err }, 'error sending email: ')
            res.sendStatus(500)
            return
        }
    },

    sendPasswordResetEmail: async (req, res) => {
        let email = req.body.email
        try {
            const user = await users.getUserByEmail(email)
            if (!user) return res.sendStatus(204)

            const token = await signResetPwdToken(email)

            await mailer.sendPhysiotherapistPasswordReset(email, token)
            logger.debug({ data: { email: email } }, 'user requested new password')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error sending reset password email: ')
            res.sendStatus(500)
            return
        }
    },

    resetPassword: async (req, res) => {
        let newPassword = req.body.newPassword, token = req.body.token
        try {
            const data_decoded = await verifyAuthToken(token)

            const user = await users.getUserByEmail(data_decoded.email)
            const isSamePWD = await bcrypt.compare(newPassword, user.hashedPassword)
            if (isSamePWD) return res.sendStatus(409)

            const newHashedPWD = bcrypt.hashSync(newPassword, 8)
            await users.updateUserNewLogin(user.id, newHashedPWD)

            logger.info({ data: user.email }, 'user updated password: ')
            return res.sendStatus(200)
        } catch (err) {
            logger.error({ error: err }, 'error updating password: ')
            if ((err.expiredAt * 1000) >= new Date().getTime()) {
                res.clearCookie(session_cookie.name, session_cookie.options)
                return res.sendStatus(401)
            }
            return res.sendStatus(500)
        }
    },

    /**
     * Get info about authenticated user
     * @param {Object} req - express request
     * @param {Object} res - express response
     * @returns {Promise<Types.User>}
     */
    getInfo: async (req, res) => {
        if (!req.user) return res.sendStatus(401)
        try {
            const user = await users.getUserByEmail(req.user.email)
            if (!user) return res.sendStatus(404)
            const response = {
                email: user.email,
                lastLoginTimestamp: user.lastLoginTimestamp,
                activated: user.activated,
                role: user.role
            }
            if (user?.role !== 'admin') response.newSurveyAvailable = await scheduler.isSurveyAvailable(user.id, user.role)
            return res.json(response)
        } catch (err) {
            logger.error({ error: err }, 'error getting info')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Update consent status for authenticated user
     * @param {Object} req - express request
     * @param {Object} req.body - updated consent status
     * @param {Object} res - express response
     * @returns {Promise<Types.User>}
     */
    updateParticipation: async (req, res) => {
        if (!req.user) return res.sendStatus(401)
        try {
            const newStatus = req.body.updatedStatus
            const user = await users.getUserByEmail(req.user.email)
            delete user.hashedPassword

            if (typeof newStatus !== 'boolean' || !user) return res.sendStatus(400)

            const updatedStatus = await users.updateOneUserParticipation(newStatus, user.id)

            return res.json({
                updatedStatus,
                role: user.role
            })
        } catch (err) {
            logger.error({ error: err }, 'error updating participation status')
            res.sendStatus(500)
            return
        }
    },
}