
import healthcheck from "./controllers/healthCheck.js";
import users from "./controllers/users.js";
import physiotherapists from "./controllers/physiotherapist.js";

const API_PREFIX = '/api'

/**
 * Setup for routes
 */
export default async (app, isAuth) => {
    console.info('Setting up routes')

    app.get(`${API_PREFIX}/health-check`, healthcheck)

    app.get('/', async function (req, res) {
        res.send('<p>OK</p>')
    })

    app.post(`${API_PREFIX}/login`, users.login)
    app.post(`${API_PREFIX}/logout`, users.logout)

    app.get(`${API_PREFIX}/users`, isAuth, users.getUsers)
    app.get(`${API_PREFIX}/users/:userID`, isAuth, users.getUser)
    app.post(`${API_PREFIX}/users`, isAuth, users.addNewUser)

    app.get(`${API_PREFIX}/patients`, isAuth, physiotherapists.getPatients)
    app.get(`${API_PREFIX}/patients/:patientID`, isAuth, physiotherapists.getPatient)
    app.post(`${API_PREFIX}/patients`, isAuth, physiotherapists.addNewPatient)
    app.delete(`${API_PREFIX}/patients/:patientID`, isAuth, physiotherapists.deletePatient)
}