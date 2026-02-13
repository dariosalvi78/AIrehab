import * as Types from '../datamodel/modeljdocs.mjs'
import physiotherapist from "../DOM/physiotherapistCollection.js"
import sessions from "../DOM/physiotherapySessionCollection.js"
import exercises from "../DOM/exercisesCollection.js"
import poe from "../DOM/poeCollection.js"
import logger from "../utils/logger.js"
import files from '../utils/fileHandler.js'
import { signPatientAccessToken, patient_cookie, verifyAuthToken, session_cookie } from "../utils/tokenAuth.js"
import mailer from '../utils/mailer/mailer.js'
import bcrypt from 'bcrypt'
import scheduler from '../utils/scheduler.js'
import config from '../utils/config.js'

export default {

    /**
    * Get all patients for a specific user (physiotherapist, admin)
    * @param {Object} req - express request
    * @param {Object} req.query pagination params: limit, pageNo, sortOrder
    * @param {Object} res - express response
    * @returns {Promise<Array<Types.Patient>>} array of patients (with maxPageNo if physiotherapist)
    */
    getPatients: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patients, testPatientID, hasTestPatient = false
        try {
            if (req.user.role == 'admin') {
                patients = await physiotherapist.getPatients()
            } else {
                const assignedTo = await physiotherapist.getOneTherapistByEmail(req.user.email)
                let results = await physiotherapist.getPatientsByEmail(req.user.email, req.query.pagination)
                
                // Clear test suite
                for (const p_test in results[0]) {
                    if (results[0][p_test].isTestPatient) {
                        testPatientID = results[0][p_test].patientID
                        hasTestPatient = true
                        const session = await sessions.getOneSessionByPatientID(testPatientID)
                        const exercise = await exercises.getExercisesInSessionByEmail(session.id, assignedTo.email)

                        for (const e of exercise) {
                            if (!e) continue
                            if (e.videoFile) await files.deleteVideo(session.id, e.id, e.videoFile)
                        }

                        await files.closeDirectory(session.id)
                        await physiotherapist.deleteOnePatient(assignedTo.id, testPatientID)
                        logger.info({ 
                            patientID: testPatientID,
                            created: exercise[0].startTimestamp,
                            exerciseType: exercise[0].type,
                            videoFile: exercise[0].videoFile
                        }, 'deleted temporary patient and associated data:')
                    }
                }
                if (hasTestPatient) results = await physiotherapist.getPatientsByEmail(req.user.email, req.query.pagination)
                patients = { patients: results[0], maxPageNo: results[results.length - 1][0].maxPage, count: results[results.length - 1][0].count }
            }
            res.send(patients)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting patients: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Get one patient for a specific physiotherapist
     * @param {Object} req - express request
     * @param {Object} req.params - patientID
     * @param {Object} res - express response
     * @returns {Promise<Types.Patient>}
    */
    getPatient: async (req, res) => {
        if (!req.user || !req.params.patientID) return res.sendStatus(403)
        try {
            let patient, patientID = req.params.patientID
            if (req.user.role == 'physiotherapist') {
                const isAssignedTo = await physiotherapist.getOnePatientByID(patientID)
                if (isAssignedTo.physiotherapistEmail !== req.user.email) {
                    return res.sendStatus(403)
                }
                patient = await physiotherapist.getOnePatientByEmail(req.user.email, patientID)

            } else if (req.user.role == 'admin') {
                patient = await physiotherapist.getOnePatientByID(patientID)
            }
            if (!patient) return res.sendStatus(404)
            else if (!patient["sessionID"]) delete patient.sessionID
            patient.access = bcrypt.hashSync(patient.physiotherapistId, 8)

            return res.send(patient)
        } catch (err) {
            logger.error({ error: err }, 'error getting patient: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Add one new patient and assigns them to a physiotherapist
     * @param {Object} req - express request
     * @param {Object} req.body - new patient data
     * @param {Object} req.query - physiotherapist email (used by admin)
     * @param {Object} res - express response
     * @returns {Promise<Types.Patient>} added patient
     */
    addNewPatient: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patient = req.body, results
        if (!patient || !patient.fullName || !patient.dateOfBirth) return res.sendStatus(400)

        const checkIfPatient = await physiotherapist.getOnePatientByName(patient.fullName)
        if (checkIfPatient) return res.sendStatus(409)

        if (req.user.role == 'admin' && !req.query.physiotherapistEmail) return res.status(400)

        try {
            if (req.user.role == 'physiotherapist') {
                results = await physiotherapist.getOneTherapistByEmail(req.user.email)
            } else if (req.user.role == 'admin' && req.query.physiotherapistEmail) {
                results = await physiotherapist.getOneTherapistByEmail(req.query.physiotherapistEmail)
                if (!results) return res.status(404).send('No physiotherapist with given email')
            }

            if (patient.isTestPatient && results) patient.fullName = `${config.test.prefix}${results.id}`
            const addedPatient = await physiotherapist.createPatient(patient, results.id)
            let patientData = { patient: addedPatient }

            if (patient.isTestPatient && addedPatient) {
                // Create temporary test suite
                const session = await sessions.createSession(addedPatient.id)
                const exercise = await exercises.createExercise(session.id, { type: patient.injuries.injuredBodyPart, notes: '' })
                logger.info({ patientID: addedPatient }, 'temporary test setup created: ')
                patientData = { patient: addedPatient, sessionID: session.id, exerciseID: exercise.id, testSession: patient.isTestPatient }
            }

            logger.info({ data: addedPatient }, `assigned ${addedPatient.id} to test leader ${results.email}`)
            return res.status(201).json({
                status: 'created', data: patientData
            })
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when adding patient: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Removes one patient permanently from physiotherapist
     * @param {Object} req - express request
     * @param {Object} req.body - physiotherapist data for deletion
     * @param {Object} req.params - patientID
     * @param {Object} res - express response
    */
    deletePatient: async (req, res) => {
        if (!req.params.patientID || !req.body.physiotherapistID) return res.sendStatus(403)
        let body = req.body
        try {
            let patient = await physiotherapist.getOnePatientByID(req.params.patientID)
            if (patient.physiotherapistId !== body.physiotherapistID) return res.sendStatus(403)
            else if (patient.sessionID) {
                return res.status(409).send('Patient is part of a session')
            }

            await physiotherapist.deleteOnePatient(body.physiotherapistID, req.params.patientID)

            logger.info({ data: { patientID: req.params.patientID } }, 'Deleted patient permanently')
            return res.sendStatus(204)
        } catch (err) {
            logger.error({ error: err }, 'error deleting patient: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Edit data for one specific patient
     * @param {Object} req - express request
     * @param {Object} req.body - new patient data
     * @param {Object} req.query - newStatus (used by patient)
     * @param {Object} req.params - patientID
     * @param {Object} res - express response
    */
    editPatient: async (req, res) => {
        let patient = req.body, newParticipationStatus = req.query.newStatus || undefined
        try {
            if (newParticipationStatus && req.patient) {
                const patient = req.patient
                let response = await physiotherapist.updateOnePatientParticipation(newParticipationStatus, req.params.patientID)
                logger.info({ patientID: req.params.patientID, status: newParticipationStatus }, 'updated patient participation status')

                if (!response.activated) physiotherapist.updateOnePatientEmail('', patient.id)
                return res.send({ status: 'updated', status: newParticipationStatus })
            }
            
            if (!req.user) return res.sendStatus(403)
            const isAssignedTo = await physiotherapist.getOnePatientByID(req.params.patientID)
            if (req.user.role == 'physiotherapist' && req.user.email !== isAssignedTo.physiotherapistEmail) return res.sendStatus(403)

            if (!patient.fullName || !patient.dateOfBirth) {
                return res.status(400).send('Please enter required fields')
            }

            await physiotherapist.updateOnePatient(patient, req.params.patientID)
            logger.info({ data: { patientID: req.params.patientID } }, 'updated patient information')
            return res.sendStatus(204)
        }
        catch (err) {
            logger.error({ error: err }, 'something went wrong when updating patient: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Assign patient with authentication to physiotherapist
     * @param {Object} req - express request
     * @param {Object} req.body - new patient data
     * @param {Object} req.params - patientID
     * @param {Object} res - express response
    */
    assignPatient: async (req, res) => {
        if (!req.params.patientID || !req.query.secret) return res.sendStatus(403)
        let patientID = req.params.patientID, secret = req.query.secret
        try {
            const patient = await physiotherapist.getOnePatientByID(patientID)
            if (
                !patient 
                || patient && !bcrypt.compareSync(patient.physiotherapistId, secret)
                || patientID !== patient.id
            ) return res.sendStatus(403)

            // Check if patient is already authenticated
            const cookie = req.cookies[patient_cookie.name]
            if (cookie) {
                const data_decoded = await verifyAuthToken(cookie)
                if (data_decoded) return res.sendStatus(200)
            }

            const { id, names, physiotherapistId, createdTimestamp } = patient
            const token = await signPatientAccessToken({ id, names, physiotherapistId, createdTimestamp, secret })
            res.cookie(patient_cookie.name, token, patient_cookie.options)
            logger.info({ patientID, assignedTo: physiotherapistId }, 'patient has authenticated to physiotherapist')
            return res.send({ token: token }).status(200)
        }
        catch (err) {
            if ((err.expiredAt * 1000) >= new Date().getTime()) {
                const token = await signPatientAccessToken({ id: patientID, secret })
                res.cookie(patient_cookie.name, token, patient_cookie.options)
                logger.info({ patientID }, 'refreshed patient authentication')
                return res.send({ token: token, status: 'refreshed' })
            }
            logger.error({ error: err }, 'patient cannot authenticate: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Get info about authenticated patient
     * @param {Object} req - express request
     * @param {Object} req.params - patientID
     * @param {Object} res - express response
     * @returns {Promise<Types.User>}
     */
    getInfo: async (req, res) => {
        if (!req.params.patientID || !req.query.secret) return res.sendStatus(400)
        let patientID = req.params.patientID, secret = req.query.secret, response = {}
        try {
            if (req.cookies[session_cookie.name]) res.clearCookie(session_cookie.name, session_cookie.options)
            const cookie = req.cookies[patient_cookie.name]
            if (!cookie) {
                const supportEmail = (await import('../utils/config.js')).default.admin.username 
                return res.status(403).send({ support: supportEmail })
            }
            let decoded_data = await verifyAuthToken(cookie)
            const patient = await physiotherapist.getOnePatientByID(decoded_data.patient.id)

            if (
                patient == undefined 
                || secret !== decoded_data.patient.secret 
                || patient.id !== patientID
            ) return res.sendStatus(404)
            delete patient.email
            delete patient.physiotherapistEmail
            delete patient.dateofbirth
            response.patient = patient
            response.newSurveyAvailable = await scheduler.isSurveyAvailable(patient.id, 'patient')            
            return res.send(response)
        } catch (err) {
            logger.error({ patientID, error: err }, 'error getting patient info')
            res.sendStatus(500)
            return
        }
    },
    sendPatientConsentEmail: async (req, res) => {
        if (!req.body.patientEmail || !req.body.patientID || !req.query.secret) return res.sendStatus(403)
        let patientEmail = req.body.patientEmail, patientID = req.body.patientID, secret = req.query.secret
        try {
            const patient = await physiotherapist.getOnePatientByID(patientID)
            if (!patient || patientID !== patient.id) return res.sendStatus(204)

            const isEmailAvailable = await physiotherapist.getPatientEmail(patientEmail)
            if (isEmailAvailable) return res.sendStatus(409)

            await mailer.sendPatientAccessLink(patientEmail, patient.id, secret)
            logger.debug({ patient: patientID }, 'patient consent email sent')

            await physiotherapist.updateOnePatientEmail(patientEmail, patientID)
            logger.info({ patient: patientID }, 'updated patient email')
            return res.send({ email: patientEmail }).status(204)
        } catch (err) {
            logger.error({ error: err }, 'error sending patient consent email: ')
            res.sendStatus(500)
            return
        }
    },
}
