
import * as Types from '../../../datamodel/modeljdocs.mjs'
import collections from "../DOM/collections.js"
import logger from "../utils/logger.js"

export default {

    /**
     * Get all ongoing physiotherapy sessions
     * @param {Object} req - express request
     * @param {Object} res - express response
     * @returns {Promise<Array<Types.PhysiotherapySession>>}
     */
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

    /**
     * Get one ongoing physiotherapy session
     * @param {Object} req - express request
     * @param {Object} req.params - sessionID
     * @param {Object} res - express response
     * @returns {Promise<Types.PhysiotherapySession>}
     */
    getSession: async (req, res) => {
        if (!req.user || !req.params.sessionID) return res.sendStatus(403)
        let session, sessionID = req.params.sessionID
        try {
            session = await collections.sessions.getSessionByID(sessionID, req.user.email)
            if (!session) return res.sendStatus(404)

            return res.send(session)
        } catch (err) {
            logger.error({ error: err }, 'error getting session: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Add one new physiotherapy session for a patient
     * @param {Object} req - express request
     * @param {Object} req.query - patientID
     * @param {Object} res - express response
     * @returns {Promise<Types.PhysiotherapySession>} added session
     */
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
    },

    // TODO: delete exercises assoicated with session
    /**
     * Delete one session
     * @param {Object} req - express request
     * @param {Object} req.params - sessionID
     * @param {Object} res - express response
    */
    deleteSession: async (req, res) => {
        if (!req.user || !req.params.sessionID) return res.sendStatus(403)
        let sessionID = req.params.sessionID
        try {
            const physiotherapist = await collections.users.getUserByEmail(req.user.email)
            const checkIfExercises = await collections.exercises.getExercisesBySession(sessionID, physiotherapist.id)
            if (checkIfExercises.length >= 1) {
                return res.status(409).send('Session has ongoing exercises')
            }

            await collections.sessions.deleteOneSession(sessionID)
            logger.info({ data: { sessionID } }, 'Deleted session permanently')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting session: ')
            res.sendStatus(500)
            return
        }
    }
}