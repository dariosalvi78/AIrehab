
import * as Types from '../datamodel/modeljdocs.mjs'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './config.js'
import users from '../DOM/usersCollection.js'
import logger from './logger.js'
import cookies from './cookies.js'
import crypto from 'node:crypto'

/**
 * Sign new access token for user
 * @param {Types.User} user
 */
const signAccessToken = async (user) => {
    return jwt.sign({ user }, config.JWT.SECRET_KEY, { expiresIn: config.JWT.EXPIRE })
}

const signResetPwdToken = async (email) => {
    return jwt.sign({ email }, config.JWT.SECRET_KEY, { expiresIn: '1h' })
}

const signPatientAccessToken = async (patient) => {
    return jwt.sign({ patient }, config.JWT.SECRET_KEY, { expiresIn: '30 days' })
}

const signInvitationToken = async (email) => {
    return jwt.sign({ email }, config.JWT.SECRET_KEY, { expiresIn: '3 days' })
}

const session_cookie = cookies.session, patient_cookie = cookies.patient

/**
 * Middleware method for authenticating user,
 * use for routes that require authorization
 */
const authenticateToken = async (req, res, next) => {
    const headers = req.headers
    const type = req.cookies[session_cookie.name]
        ? { name: 'user', cookie: session_cookie }
        : { name: 'patient', cookie: patient_cookie }
    const token = req.cookies[type.cookie.name]
    try {
        if (!token || !headers["x-poe-api"]) {
            logger.debug({ data: headers }, 'blocking unauthorized request')
            return res.sendStatus(401)
        }
        jwt.verify(token, config.JWT.SECRET_KEY, (err, data) => {
            if (err) {
                res.clearCookie(type.cookie.name, type.cookie.options)
                return res.status(401).send('Session has expired, please log in again')
            }
            req[type.name] = data[type.name]
            next()
        })
    } catch (err) {
        logger.error({ error: err }, 'cant authenticate token: ')
        return res.sendStatus(500)
    }
}

/**
 * Verify JWT token
 * @returns {Types.User}
 */
const verifyAuthToken = async (authToken) => {
    return new Promise((resolve, reject) => {
        try {
            const token = authToken
            jwt.verify(token, config.JWT.SECRET_KEY, (err, data) => {
                if (err) {
                    return reject({ reason: err.message, expiredAt: err.expiredAt })
                }
                resolve(data)
            })
        } catch (err) {
            console.error('cant authenticate token: ', err)
            return reject(err)
        }
    })
}

/**
 * Creates admin user if not in DB
 */
const createAdmin = async () => {
    try {
        const admin = await users.getUsersByRole('admin')
        if (admin.length) return  
        let hash = bcrypt.hashSync(config.admin.password, 8)

        const newUser = await users.createUser(config.admin.username, hash, 'admin')
        delete newUser.hashedPassword
        logger.info({ data: newUser }, 'no admin in db, new user created')
        await signAccessToken(newUser)
    } catch (err) {
        logger.error({ error: err }, 'something went wrong when creating admin user')
    }
}

export {
    signAccessToken,
    signResetPwdToken,
    authenticateToken,
    verifyAuthToken,
    createAdmin,
    signPatientAccessToken,
    signInvitationToken,
    session_cookie,
    patient_cookie
}