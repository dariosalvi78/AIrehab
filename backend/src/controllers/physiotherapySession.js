
import * as Types from '../../../datamodel/modeljdocs.mjs'
import sessions from "../DOM/physiotherapySessionCollection.js"
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import physiotherapist from '../DOM/physiotherapistCollection.js'
import files from '../utils/fileHandler.js'
import config from '../utils/config.js'

export default {

    /**
     * Get all ongoing physiotherapy sessions
     * @param {Object} req - express request
     * @param {Object} req.query pagination params: limit, pageNo, sortOrder
     * @param {Object} res - express response
     * @returns {Promise<Array<Types.PhysiotherapySession>>}
     */
    getSessions: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let physiotherapy_sessions
        try {
            if (req.user.role == 'admin') {
                physiotherapy_sessions = await sessions.getSessions()
            } else if (req.user.role == 'physiotherapist') {
                let results = await sessions.getSessionsByEmail(req.user.email, req.query.pagination)
                physiotherapy_sessions = { sessions: results[0], maxPageNo: results[results.length - 1][0].maxPage }
            }
            res.send(physiotherapy_sessions)
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
            session = await sessions.getSessionByID(sessionID, req.user.email)
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
        if (!req.user || !req.query.patientID) return res.sendStatus(403)
        let patientID = req.query.patientID

        try {
            if (req.user.role == 'physiotherapist') {
                const isAssignedTo = await physiotherapist.getOnePatientByEmail(req.user.email, patientID)
                if (!isAssignedTo) return res.sendStatus(403)    
            }
            const addedSession = await sessions.createSession(patientID)
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
            if (req.user.role == 'physiotherapist') {
                const checkIfExercises = await exercises.getExercisesInSessionByEmail(sessionID, req.user.email)
                if (checkIfExercises.length >= 1) {
                    return res.status(409).send('Session has ongoing exercises')
                }
            }
            await files.closeDirectory(sessionID)
            await sessions.deleteOneSession(sessionID)
            logger.info({ data: { sessionID } }, 'Deleted session permanently')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting session: ')
            res.sendStatus(500)
            return
        }
    },

    editSession: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let session = req.body.data, sessionID = req.params.sessionID

        try {
            console.log(sessionID, session)
            // const addedSession = await sessions.createSession(patientID)
            // delete addedSession.patientId

            // logger.info({ data: addedSession }, `new session created, assigned to: ${req.user.email}`)
            // return res.status(201).json({
            //     status: 'created', data: { session: addedSession }
            // })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when editing session: ')
            res.sendStatus(500)
            return
        }
    },
}