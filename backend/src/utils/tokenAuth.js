
import * as Types from '../../../datamodel/modeljdocs.mjs'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './config.js'
import collections from '../DOM/collections.js'
import logger from './logger.js'

/**
 * Sign new access token for user
 * @param {Types.User} user
 */
const signAccessToken = async (user) => {
    return jwt.sign({ user }, config.JWT.SECRET_KEY, { expiresIn: config.JWT.EXPIRE })
}

/**
 * Middleware method for authenticating user,
 * use for routes that require authorization
 */
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) return res.sendStatus(401)

        jwt.verify(token, config.JWT.SECRET_KEY, (err, data) => {
            if (err) {
                res.clearCookie('token')
                return res.status(401).send('Session has expired, please log in again')
            }
            req.user = data.user
            next()
        })
    } catch (err) {
        console.error('cant authenticate token: ', err)
        return res.sendStatus(500)
    }
}

/**
 * Creates admin user if not in DB
 */
const createAdmin = async () => {
    const users = await collections.users.getUsersByRole('admin')
    if (users.length <= 0) {
        let hash = bcrypt.hashSync(config.admin.password, 8)
        try {
            const newUser = await collections.users.createUser(config.admin.username, hash, 'admin')
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
    authenticateToken,
    createAdmin
}