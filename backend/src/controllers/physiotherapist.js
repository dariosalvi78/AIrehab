
import collection from "../DOM/physiotherapistCollection.js"

export default {

    /**
     * Get all patients for a specific physiotherapist
     */
    getPatients: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        try {
            const patients = await collection.getPatientsByEmail(req.user.email)
            res.send(patients)
            return
        } catch (err) {
            console.error('error getting patients: ', err)
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
            const patient = await collection.getOnePatientByEmail(req.user.email, req.params.patientID)
            res.send(patient)
        } catch (err) {
            console.error('error getting patient: ', err)
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

        const checkIfPatient = await collection.getOnePatientByName(patient.fullName)
        if (checkIfPatient) {
            return res.status(409).send(`${patient.fullName} is already a patient`)
        }

        try {
            const physiotherapist = await collection.getOneTherapistByEmail(req.user.email)
            const addedPatient = await collection.createPatient(patient, physiotherapist.id)

            console.info(`assigned ${addedPatient.id} to physiotherapist ${physiotherapist.email}`)
            return res.status(201).json({
                status: 'created', data: { patient: addedPatient }
            })
        }
        catch (err) {
            console.error('something went wrong when adding patient: ', err)
            res.sendStatus(500)
            return
        }
    }
}