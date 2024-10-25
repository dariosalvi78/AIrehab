
/**
 * Express backend
*/

import express from 'express'
import helmet from 'helmet'
import setRoutes from './routes.js'
import config from './utils/config.js'
import { authenticateToken, createAdmin } from './utils/tokenAuth.js'
import cookieParser from 'cookie-parser'
import connection from './db/dbConnection.js'
import db from './db/dbDriver.js'
import mailer from './utils/mailer.js'

(async () => {

    console.log('Starting express app')

    const port = config.server.port
    const hostname = config.domain
    const app = express()
    app.use(helmet())
    app.use(cookieParser())

    await db.init(connection.msSQLConnection)
    await mailer.init()

    if (config.admin) await createAdmin()

    app.use(express.urlencoded({ limit: '20mb', extended: false }))
    app.use(express.json({ limit: '20mb' }))
    app.use(express.text({ limit: '20mb' }))

    // CORS & access control policy
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Vary', 'Cookie') // cache any cookies
        res.header('Access-Control-Allow-Methods', 'PUT, PATCH, DELETE, GET, POST')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        next()
    })

    await setRoutes(app, authenticateToken)

    app.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`)
    })

})()
