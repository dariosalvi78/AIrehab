
import healthcheck from "./controllers/healthCheck.js";
import users from "./controllers/users.js";
import physiotherapists from "./controllers/physiotherapist.js";
import sessions from "./controllers/physiotherapySession.js";
import exercises from "./controllers/exercises.js";
import poe from "./controllers/poe.js";
import attachments from "./controllers/attachments.js";

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
    app.delete(`${API_PREFIX}/users/:userID`, isAuth, users.deleteUser)

    app.get(`${API_PREFIX}/patients`, isAuth, physiotherapists.getPatients)
    app.get(`${API_PREFIX}/patients/:patientID`, isAuth, physiotherapists.getPatient)
    app.post(`${API_PREFIX}/patients`, isAuth, physiotherapists.addNewPatient)
    app.delete(`${API_PREFIX}/patients/:patientID`, isAuth, physiotherapists.deletePatient)
    app.put(`${API_PREFIX}/patients/:patientID`, isAuth, physiotherapists.editPatient)

    app.get(`${API_PREFIX}/sessions`, isAuth, sessions.getSessions)
    app.get(`${API_PREFIX}/sessions/:sessionID`, isAuth, sessions.getSession)
    app.post(`${API_PREFIX}/sessions`, isAuth, sessions.addNewSession)
    app.delete(`${API_PREFIX}/sessions/:sessionID`, isAuth, sessions.deleteSession)

    app.get(`${API_PREFIX}/exercises`, isAuth, exercises.getExercises)
    app.get(`${API_PREFIX}/exercises/:exerciseID`, isAuth, exercises.getExercise)
    app.post(`${API_PREFIX}/exercises`, isAuth, exercises.addNewExercise)
    app.delete(`${API_PREFIX}/exercises/:exerciseID`, isAuth, exercises.deleteExercise)

    app.get(`${API_PREFIX}/poe/:sessionID/:exerciseID`, isAuth, poe.getEvaluation)
    app.post(`${API_PREFIX}/poe/:sessionID/:exerciseID`, isAuth, poe.sendEvaluation)

    app.get(`${API_PREFIX}/attachments/:exerciseID`, isAuth, attachments.getExerciseFile)
    app.post(`${API_PREFIX}/attachments/:exerciseID`, isAuth, attachments.sendExerciseFile)
}