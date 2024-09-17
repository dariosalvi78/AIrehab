
import bcrypt from 'bcrypt'
import { signAccessToken } from "../utils/tokenAuth.js"
import collections from "../DOM/collections.js"
import logger from "../utils/logger.js"

export default {

    getSessions: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let sessions
        try {
            if (req.user.role == 'admin') {
                sessions = await collections.exercises.getSessions()
            } else if (req.user.role == 'physiotherapist') {
                sessions = await collections.exercises.getSessionsByEmail(req.user.email)
            }
            res.send(sessions)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting sessions: ')
            res.sendStatus(500)
            return
        }
    },

    addNewSession: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patientID = req.query.patientID

        try {
            const addedSession = await collections.exercises.createSession(patientID)
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
}