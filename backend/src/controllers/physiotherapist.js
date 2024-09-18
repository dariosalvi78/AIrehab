
import collections from "../DOM/collections.js"
import logger from "../utils/logger.js"

export default {

    /**
     * Get all patients for a specific physiotherapist
     */
    getPatients: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patients
        try {
            if (req.user.role == 'admin') {
                patients = await collections.physiotherapist.getPatients()
            } else {
                patients = await collections.physiotherapist.getPatientsByEmail(req.user.email)
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
    addNewPatient: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let patient = req.body

        if (!patient || !patient.fullName || !patient.dateOfBirth) {
            return res.status(400).send('Please enter required fields')
        }

        const checkIfPatient = await collections.physiotherapist.getOnePatientByName(patient.fullName)
        if (checkIfPatient) {
            return res.status(409).send(`${patient.fullName} is already a patient`)
        }

        try {
            const physiotherapist = await collections.physiotherapist.getOneTherapistByEmail(req.user.email)
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