
import db from "../db.js"
import bcrypt from 'bcrypt'
import { signAccessToken } from "../utils/tokenAuth.js"
import collection from "../DOM/usersCollection.js"
import logger from "../utils/logger.js"

export default {

    /**
     * login user, checks if user
     * has valid credentials
     * @returns user object
     */
    login: async (req, res) => {
        if (!req.body.email || !req.body.password) {
            res.sendStatus(401)
            return
        }
        try {
            const user = await collection.getUserByEmail(req.body.email)

            if (!user) return res.sendStatus(404)

            if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
                // user OK, continue
                await collection.updateUserLoginTimestamp(user.id)
                delete user.hashedPassword
                delete user.id

                logger.debug({ data: user }, 'user logged in')
                const token = await signAccessToken(user)
                res.cookie('token', token)
                return res.send({ user })
            } else {
                res.sendStatus(404)
                return
            }
        } catch (err) {
            logger.error({ error: err }, 'error logging out user: ')
            res.sendStatus(500)
            return
        }
    },

    logout: async (req, res) => {
        try {
            if (req.user) {
                console.info('user logged out: ', req.user)
            }
            req.cookies = null
            return res.sendStatus(204)
        } catch (err) {
            return res.status(500).send('Cannot log out ' + req.user.email)
        }
    },

    getUsers: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        try {
            const users = await collection.getUsers()
            res.send(users)
        } catch (err) {
            logger.error({ error: err }, 'error getting users')
            res.sendStatus(500)
            return
        }
    },

    getUser: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        try {
            const user = await collection.getOneUser(req.params.userID)
            return res.send(user)
        } catch (err) {
            logger.error({ error: err }, 'error getting user')
            res.sendStatus(500)
            return
        }
    },

    // TODO: let user complete registration using email
    addNewUser: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        let body = req.body

        if (!body.role || !body.email || !body.password) {
            res.sendStatus(400)
            return
        }

        const isUser = await collection.getUserByEmail(body.email)
        if (isUser) {
            res.status(409).send(`${body.email} is already registered`)
            return
        }

        try {
            let hash = bcrypt.hashSync(body.password, 8)
            const user = await collection.createUser(body.email, hash, body.role)
            logger.info({ data: user }, 'new user created: ')

            const token = await signAccessToken({ userID: user.id })
            return res.status(201).json({
                status: 'created', token, data: { newUser: user }
            })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when adding user')
            res.sendStatus(500)
            return
        }
    }
}