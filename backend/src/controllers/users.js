
import db from "../db.js"
import bcrypt from 'bcrypt'

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

                res.send(user)
                return
            } else {
                res.sendStatus(404)
                return
            }
        } catch (err) {
            console.error('error finding user: ', err)
        }
    }
}