
/**
 * Express backend
*/

import express from 'express'
import helmet from 'helmet'
import setRoutes from './routes.js'
import config from './utils/config.js'
import historyRouterMode from 'connect-history-api-fallback'
import { authenticateToken, createAdmin } from './utils/tokenAuth.js'
import cookieParser from 'cookie-parser'
import connection from './db/dbConnection.js'
import db from './db/dbDriver.js'
import mailer from './utils/mailer/mailer.js'
import http from 'http'
import https from 'https'
import fs from 'node:fs'
import logger from './utils/logger.js'

(async () => {

    console.log('Starting express app')

    const port = config.server.port || 8080
    const hostname = config.domain
    const app = express()
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                'media-src': [`'self' blob:`],
                'img-src': [`'self' data:`]
            }
        }
    }))
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
        res.header('Cache-Control', 'no-cache, must-revalidate')
        next()
    })

    app.use(historyRouterMode())
    app.use(express.static('public'))

    await setRoutes(app, authenticateToken)

    let server, certs = null
    try {
        if (config.certs.key_file && config.certs.chain_file) {
            const key = fs.readFileSync(config.certs.key_file, 'utf8')
            const cert = fs.readFileSync(config.certs.chain_file, 'utf8')
            certs = { key, cert }
        }
        certs
            ? server = https.createServer({ ...certs }, app)
            : // HTTP no certificate
            server = http.createServer(app)

    } catch (err) {
        logger.error({ error: err, certificates: config.certs, environment: config.environment }, 'could not verify certificates: ')
        server = http.createServer(app)
        certs = null
    }

    server.listen(port, () => {
        console.log(`Server running on ${certs ? 'https' : 'http'}://${hostname}:${port}\nEnvironment: ${config.environment}`)
    })

})()
