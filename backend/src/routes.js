
import healthcheck from "./controllers/healthCheck.js";
import users from "./controllers/users.js";
import patients from "./controllers/patient.js";

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
    app.get(`${API_PREFIX}/users`, isAuth, users.getUsers)
    app.post(`${API_PREFIX}/users`, isAuth, users.addNewUser)

    app.get(`${API_PREFIX}/patients`, isAuth, patients.getPatients)
    app.get(`${API_PREFIX}/patients/:patientID`, isAuth, patients.getPatient)
    app.post(`${API_PREFIX}/patients`, isAuth, patients.addNewPatient)
}