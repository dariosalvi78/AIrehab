import * as Types from '../datamodel/modeljdocs.mjs'
import physiotherapist from "../DOM/physiotherapistCollection.js"
import logger from "../utils/logger.js"

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
        let patients
        try {
            if (req.user.role == 'admin') {
                patients = await physiotherapist.getPatients()
            } else {
                let results = await physiotherapist.getPatientsByEmail(req.user.email, req.query.pagination)
                patients = { patients: results[0], maxPageNo: results[results.length - 1][0].maxPage }
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
            let patient
            if (req.user.role == 'physiotherapist') {
                const isAssignedTo = await physiotherapist.getOnePatientByID(req.params.patientID)
                if (isAssignedTo.physiotherapistEmail !== req.user.email) {
                    return res.sendStatus(403)
                }
                patient = await physiotherapist.getOnePatientByEmail(req.user.email, req.params.patientID)
            } else if (req.user.role == 'admin') {
                patient = await physiotherapist.getOnePatientByID(req.params.patientID)
            }
            if (!patient) return res.sendStatus(404)
            else if (!patient["sessionID"]) delete patient.sessionID

            return res.send(patient)
        } catch (err) {
            logger.error({ error: err }, 'error getting patient: ')
            res.sendStatus(500)
            return
        }
    },

    // TODO: let user complete registration using email
    // allow physiotherapist to add user for now
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
        if (!patient || !patient.fullName || !patient.dateOfBirth) {
            return res.status(400).send('Please enter required fields')
        }

        const checkIfPatient = await physiotherapist.getOnePatientByName(patient.fullName)
        if (checkIfPatient) {
            return res.status(409).send(`${patient.fullName} is already a patient`)
        }

        if (req.user.role == 'admin' && !req.query.physiotherapistEmail) {
            return res.status(400).send('Please enter physiotherapist email')
        }

        try {
            if (req.user.role == 'physiotherapist') {
                results = await physiotherapist.getOneTherapistByEmail(req.user.email)
            } else if (req.user.role == 'admin' && req.query.physiotherapistEmail) {
                results = await physiotherapist.getOneTherapistByEmail(req.query.physiotherapistEmail)
                if (!results) return res.status(404).send('No physiotherapist with given email')
            }
            const addedPatient = await physiotherapist.createPatient(patient, results.id)

            logger.info({ data: addedPatient }, `assigned ${addedPatient.id} to test leader ${results.email}`)
            return res.status(201).json({
                status: 'created', data: { patient: addedPatient }
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
     * @param {Object} req.params - patientID
     * @param {Object} res - express response
    */
    editPatient: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patient = req.body
        try {
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
    }
}