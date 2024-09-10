
import jwt from 'jsonwebtoken'
import db from '../db.js'

/**
 * Sign new access token for user
 */
const signAccessToken = async (user) => {
    // TODO: use config instead of process.env
    return jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE })
}

/**
 * Middleware method for authenticating user,
 * use for routes that require authorization
 */
const authenticateToken = async (req, res, next) => {
    try {
        // TODO: use a cookie parser, https://expressjs.com/en/resources/middleware/cookie-parser.html
        const token = req.headers['cookie'].split('=')[1]
        if (!token) return res.sendStatus(401)

        // TODO: use config instead of process.env
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (err) return res.sendStatus(403)
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
 * @param {*} config config -> .env
 */
// TODO: remove config as a param, just import the object
const createAdmin = async (config) => {
    const checkIfExists = await db.query("SELECT COUNT(*) as u FROM [user] WHERE role = 'admin';")
    if (!checkIfExists.recordset[0].u) {
        let hash = bcrypt.hashSync(config.admin.password, 8)
        await db.query(`
                    INSERT INTO [user]
                    (id, email, hashedpassword, role, createdTimestamp)
                    OUTPUT Inserted.id, Inserted.email, Inserted.role, Inserted.createdTimestamp
                    VALUES(NEWID(), '${config.admin.username}', '${hash}', 'admin', CURRENT_TIMESTAMP)
                `)
            .then(async (res) => {
                if (res) {
                    console.info('no admin in db, new user created')
                    await signAccessToken(res.recordset[0])
                }
            })
            .catch((err) => console.info('something went wrong when creating admin user: ', err))
    }
}

export {
    signAccessToken,
    authenticateToken,
    createAdmin
}