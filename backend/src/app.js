
/**
 * Express backend
*/

import express from 'express'
import helmet from 'helmet'
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
    await setRoutes(app)

    app.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`)
    })
    
})()
