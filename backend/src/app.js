
/**
 * Express backend
*/

import express from 'express'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import setRoutes from './routes.js'
import { loadConfig } from './utils/config.js'
import db from './db.js'

(async () => {

    console.log('Starting express app')

    const config = loadConfig()

    const port = config.db.port
    const hostname = config.db.host
    const app = express()
    app.use(helmet())


    if (config.admin) {
        const checkIfExists = await db.query('SELECT COUNT(*) as u FROM [user];')
        if (!checkIfExists.recordset[0].u) {
            let hash = bcrypt.hashSync(config.admin.password, 8)
            await db.query(`
                    INSERT INTO [user]
                    (id, email, hashedpassword, role, createdTimestamp)
                    VALUES(NEWID(), '${config.admin.username}', '${hash}', 'admin', CURRENT_TIMESTAMP)
                `)
                .then((res) => { if (res) console.info('no admin in db, new user created') })
                .catch((err) => console.info('something went wrong when creating admin user: ', err))
        }
    }
    
    app.use(express.urlencoded({ limit: '20mb', extended: false }))
    app.use(express.json({ limit: '20mb' }))
    app.use(express.text({ limit: '20mb' }))

    await setRoutes(app)

    app.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`)
    })

})()
