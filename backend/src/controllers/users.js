
import db from "../db.js"
import bcrypt from 'bcrypt'
import { signAccessToken } from "../utils/tokenAuth.js"
import DOM from "../DOM/usersMap.js"

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
            // TODO: use the db layer abstraction instead
            const user = await DOM.getUserByEmail(req.body.email)

            if (!user) return res.sendStatus(404)

            if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
                // user OK, continue
                console.info('found user: ', user.email)
                await DOM.updateUserLoginTimestamp(user.id)
                delete user.hashedPassword
                delete user.id

                const token = await signAccessToken(user)
                res.cookie('token', token)
                return res.send({ user })
            } else {
                res.sendStatus(404)
                return
            }
        } catch (err) {
            console.error('error finding user: ', err)
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
            const users = await DOM.getUsers()
            res.send(users)
        } catch (err) {
            console.error('error getting users: ', err)
            res.sendStatus(500)
            return
        }
    },

    getUser: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        try {
            const user = await DOM.getOneUser(req.params.userID)
            return res.send(user)
        } catch (err) {
            console.error('error getting user: ', err)
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

        const isUser = await DOM.getUserByEmail(body.email)
        if (isUser) {
            res.status(409).send(`${body.email} is already registered`)
            return
        }

        try {
            let hash = bcrypt.hashSync(body.password, 8)
            const user = await DOM.createUser(body.email, hash, body.role)
            console.info('new user created: ', user)

            const token = await signAccessToken({ userID: user.id })
            return res.status(201).json({
                status: 'created', token, data: { newUser: user }
            })
        }
        catch (err) {
            console.error('something went wrong when adding user: ', err)
            res.sendStatus(500)
            return
        }
    }
}