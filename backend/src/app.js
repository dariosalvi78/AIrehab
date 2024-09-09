
/**
 * Express backend
*/

import express from 'express'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import setRoutes from './routes.js'
import { loadConfig } from './utils/config.js'
import db from './db.js'
import { authenticateToken, createAdmin } from './utils/tokenAuth.js'

(async () => {

    console.log('Starting express app')

    const config = loadConfig()

    const port = config.db.port
    const hostname = config.db.host
    const app = express()
    app.use(helmet())

    if (config.admin) await createAdmin(config)

    app.use(express.urlencoded({ limit: '20mb', extended: false }))
    app.use(express.json({ limit: '20mb' }))
    app.use(express.text({ limit: '20mb' }))

    await setRoutes(app, authenticateToken)

    app.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`)
    })

})()
