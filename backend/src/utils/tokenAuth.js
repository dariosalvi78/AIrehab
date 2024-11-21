
import * as Types from '../datamodel/modeljdocs.mjs'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './config.js'
import users from '../DOM/usersCollection.js'
import logger from './logger.js'

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

const session_cookie = {
    name: '__Host-session.id',
    options: {
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
        path: '/'
    }
}

/**
 * Middleware method for authenticating user,
 * use for routes that require authorization
 */
const authenticateToken = async (req, res, next) => {
    const headers = req.headers
    const token = req.cookies[session_cookie.name]
    try {
        if (!token || !headers["x-poe-api"]) {
            logger.debug({ data: headers }, 'blocking unauthorized request')
            return res.sendStatus(401)
        }
        jwt.verify(token, config.JWT.SECRET_KEY, (err, data) => {
            if (err) {
                res.clearCookie(session_cookie.name, session_cookie.options)
                return res.status(401).send('Session has expired, please log in again')
            }
            req.user = data.user
            next()
        })
    } catch (err) {
        logger.error({ error: err }, 'cant authenticate token: ')
        return res.sendStatus(500)
    }
}

/**
 * Verify reset password token
 * @returns {Types.User}
 */
const authenticateResetPWDToken = async (resetToken) => {
    return new Promise((resolve, reject) => {
        try {
            const token = resetToken
            jwt.verify(token, config.JWT.SECRET_KEY, (err, data) => {
                if (err) {
                    return reject({ reason: err.message, expiredAt: err.expiredAt })
                }
                resolve(data)
            })
        } catch (err) {
            console.error('cant authenticate reset password token: ', err)
            return reject(err)
        }
    })
}

/**
 * Creates admin user if not in DB
 */
const createAdmin = async () => {
    const admin = await users.getUsersByRole('admin')
    if (admin.length <= 0) {
        let hash = bcrypt.hashSync(config.admin.password, 8)
        try {
            const newUser = await users.createUser(config.admin.username, hash, 'admin')
            delete newUser.hashedPassword
            logger.info({ data: newUser }, 'no admin in db, new user created')
            await signAccessToken(newUser)
        } catch (err) {
            logger.error({ error: err }, 'something went wrong when creating admin user')
        }
    }
}

export {
    signAccessToken,
    signResetPwdToken,
    authenticateToken,
    authenticateResetPWDToken,
    createAdmin,
    session_cookie
}