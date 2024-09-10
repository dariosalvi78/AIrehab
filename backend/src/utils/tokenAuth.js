
import * as Types from '../../../datamodel/modeljdocs.mjs'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './config.js'
import DOM from '../DOM/usersMap.js'

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
        const token = req.cookies.token // req.headers['cookie'].split('=')[1]
        if (!token) return res.sendStatus(401)

        jwt.verify(token, config.JWT.SECRET_KEY, (err, data) => {
            if (err) {
                // TODO: remove the JWT cookie
                req.cookies = null
                res.status(401).send('Session has expired, please log in again')
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
    const users = await DOM.getUsersByRole('admin') // await db.query("SELECT COUNT(*) as u FROM [user] WHERE role = 'admin';")
    if (users.length <= 0) {
        let hash = bcrypt.hashSync(config.admin.password, 8)
        try {
            const newUser = await DOM.createUser(config.admin.username, hash, 'admin')
            console.info('no admin in db, new user created')
            await signAccessToken(newUser)
        } catch (err) {
            // TODO: use a logging library
            console.error('something went wrong when creating admin user: ', err)
        }
    }
}

export {
    signAccessToken,
    authenticateToken,
    createAdmin
}