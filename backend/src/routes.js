
import healthcheck from "./controllers/healthCheck.js";
import users from "./controllers/users.js";
import db from "./db";

const API_PREFIX = '/api'

/**
 * Setup for routes
 */
export default async (app) => {
    console.info('Setting up routes')

    app.get(`${API_PREFIX}/health-check`, healthcheck)

    app.get('/', async function (req, res) {
        console.log('res', res)
        res.send('<p>OK</p>')
    })
}