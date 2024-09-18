
import collections from "../DOM/collections.js"
import logger from "../utils/logger.js"

export default {

    getSessions: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let sessions
        try {
            if (req.user.role == 'admin') {
                sessions = await collections.sessions.getSessions()
            } else if (req.user.role == 'physiotherapist') {
                sessions = await collections.sessions.getSessionsByEmail(req.user.email)
            }
            res.send(sessions)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting sessions: ')
            res.sendStatus(500)
            return
        }
    },

    getSession: async (req, res) => {
        if (!req.user || !req.params.sessionID) return res.sendStatus(403)
        let session, sessionID = req.params.sessionID
        try {
            session = await collections.sessions.getSessionByID(sessionID, req.user.email)
            return res.send(session)
        } catch (err) {
            logger.error({ error: err }, 'error getting session: ')
            res.sendStatus(500)
            return
        }
    },

    addNewSession: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patientID = req.query.patientID

        try {
            const addedSession = await collections.sessions.createSession(patientID)
            delete addedSession.patientId

            logger.info({ data: addedSession }, `new session created, assigned to: ${req.user.email}`)
            return res.status(201).json({
                status: 'created', data: { session: addedSession }
            })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when creating session: ')
            res.sendStatus(500)
            return
        }
    }
}