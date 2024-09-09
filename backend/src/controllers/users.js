
import db from "../db.js"
import bcrypt from 'bcrypt'
import { signAccessToken } from "../utils/tokenAuth.js"

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
            const response = await db.query(`
                    SELECT id, email, hashedPassword, role, createdTimestamp, lastLoginTimestamp FROM [user]
                    WHERE email = '${req.body.email}';
                `)

            if (response.recordset.length <= 0) {
                res.sendStatus(404)
                return
            }
            let user = response.recordset[0]

            if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
                // user OK, continue
                console.info('found user: ', user.email)
                await db.query(`
                    UPDATE [user] 
                    SET [user].lastLoginTimestamp = CURRENT_TIMESTAMP
                    WHERE [user].id = '${user.id}';
                `)
                delete user.hashedPassword
                delete user.id

                const token = await signAccessToken(user)
                res.send({ user, token })
                return
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

    // logout: async (req, res) => {
    //     console.info('user logged out', req.user)
    // },

    getUsers: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        try {
            const response = await db.query(`SELECT id, email, role, createdTimestamp, lastLoginTimestamp FROM [user] WHERE role != 'admin';`)
            res.send(response.recordset)
        } catch (err) {
            console.error('error getting users: ', err)
            res.sendStatus(500)
            return
        }
    },

    getUser: async (req, res) => {
    },

    // TODO: let user complete registration using email
    addNewUser: async (req, res) => {
        if (!req.user || req.user.role !== 'admin') return res.sendStatus(403)
        let query, newUser, user = req.body

        if (!user.role || !user.email || !user.password) {
            res.sendStatus(400)
            return
        }

        const response = await db.query(`SELECT COUNT(*) as c FROM [user] WHERE email = '${user.email}';`)
        if (response.recordset[0].c !== 0) {
            res.status(409).send(`${user.email} is already registered`)
            return
        }

        try {
            let hash = bcrypt.hashSync(user.password, 8)
            const response = await db.query(`
                INSERT INTO [user] 
                (id, email, hashedpassword, role, createdTimestamp)
                OUTPUT Inserted.id, Inserted.email, Inserted.role, Inserted.createdTimestamp
                VALUES(NEWID(), '${user.email}', '${hash}', '${user.role}', CURRENT_TIMESTAMP);
            `)
            newUser = response.recordset[0]
            console.info('new user created: ', newUser)

            const token = await signAccessToken({ userID: newUser.id })
            return res.status(201).json({
                status: 'created', token, data: { newUser }
            })
        }
        catch (err) {
            console.error('something went wrong when adding user: ', err)
            res.sendStatus(500)
            return
        }
    }
}