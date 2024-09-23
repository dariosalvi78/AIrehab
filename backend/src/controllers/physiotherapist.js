import * as Types from '../../../datamodel/modeljdocs.mjs'
import collections from "../DOM/collections.js"
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
        // console.log(req.query.pagination)
        try {
            if (req.user.role == 'admin') {
                patients = await collections.physiotherapist.getPatients()
            } else {
                let results = await collections.physiotherapist.getPatientsByEmail(req.user.email, req.query.pagination)
                patients = { patients: results[0], maxPageNo: results[results.length - 1][0].maxPage }
            }
            // console.log(patients)
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
                patient = await collections.physiotherapist.getOnePatientByEmail(req.user.email, req.params.patientID)
            } else if (req.user.role == 'admin') {
                patient = await collections.physiotherapist.getOnePatientByID(req.params.patientID)
            }
            if (!patient["sessionID"]) delete patient.sessionID
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
        let patient = req.body, physiotherapist
        if (!patient || !patient.fullName || !patient.dateOfBirth) {
            return res.status(400).send('Please enter required fields')
        }

        const checkIfPatient = await collections.physiotherapist.getOnePatientByName(patient.fullName)
        if (checkIfPatient) {
            return res.status(409).send(`${patient.fullName} is already a patient`)
        }

        try {
            if (req.user.role == 'physiotherapist') {
                physiotherapist = await collections.physiotherapist.getOneTherapistByEmail(req.user.email)
            } else if (req.user.role == 'admin' && req.query.physiotherapistEmail) {
                physiotherapist = await collections.physiotherapist.getOneTherapistByEmail(req.query.physiotherapistEmail)
                if (!physiotherapist) return res.status(404).send('No physiotherapist with given email')
            }
            const addedPatient = await collections.physiotherapist.createPatient(patient, physiotherapist.id)

            logger.info({ data: addedPatient }, `assigned ${addedPatient.id} to physiotherapist ${physiotherapist.email}`)
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
        if (!req.params.patientID || req.user.role !== 'admin') return res.sendStatus(403)
        let physiotherapist = req.body
        try {
            let patient = await collections.physiotherapist.getOnePatientByID(req.params.patientID)
            if (patient.sessionID) {
                return res.status(409).send('Patient is part of a session')
            }

            await collections.physiotherapist.deleteOnePatient(physiotherapist.physiotherapistID, req.params.patientID)
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
        if (req.user.role !== 'admin') return res.sendStatus(403)
        let patient = req.body
        try {
            if (!patient.fullName || !patient.dateOfBirth) {
                return res.status(400).send('Please enter required fields')
            }

            await collections.physiotherapist.updateOnePatient(patient, req.params.patientID)
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