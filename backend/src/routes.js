
import healthcheck from "./controllers/healthCheck.js";

const API_PREFIX = '/api'

/**
 * Setup for routes
 */
export default async (app) => {
    console.info('Setting up routes')

    app.get(`${API_PREFIX}/health-check`, healthcheck)

    app.get('/', async function (req, res) {
        res.send('<p>OK</p>')
    })
}