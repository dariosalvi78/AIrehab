import * as Types from '../../../datamodel/modeljdocs.mjs'

let db = undefined

export const physiotherapist = {
    init: async function (DB) {
        if (DB) {
            db = DB
            return physiotherapist
        }
    },
    /**
     * Get all patients for a specific physiotherapist
     * @param {Types.User["email"]} therapistEmail 
     * @returns {Promise<Array.<Types.Patient>>}
     */
    getPatientsByEmail: async function (therapistEmail) {
        const response = await db.query(`
            SELECT p.names, p.id as patientID FROM [user] u
            INNER JOIN [patient] p ON u.id = p.physiotherapistId
            WHERE u.email = '${therapistEmail}';
        `)
        return response.recordset
    },
    /**
     * Get one patient for a specific physiotherapist
     * @param {Types.User["email"]} therapistEmail 
     * @param {Types.Patient["id"]} patientID 
     * @returns {Promise<Types.Patient>}
     */
    getOnePatientByEmail: async function (therapistEmail, patientID) {
        const response = await db.query(`
            SELECT TOP 1 p.* FROM [patient] p
            INNER JOIN [user] u ON p.physiotherapistId = u.id
            WHERE p.id = '${patientID}'
            AND u.email = '${therapistEmail}';
        `)
        return response.recordset[0]
    },

    /**
     * Get one physiotherapist with given email
     * @param {Types.User["email"]} therapistEmail 
     * @returns {Promise<Types.User>}
     */
    getOneTherapistByEmail: async function (therapistEmail) {
        const response = await db.query(`
            SELECT TOP 1 u.* FROM [user] u
            WHERE u.email = '${therapistEmail}'
            AND u.role = 'physiotherapist';
        `)
        return response.recordset[0]
    },

    /**
     * Get one patient with given full name
     * @param {Types.Patient["names"]} patientName 
     * @returns {Promise<Types.Patient>}
     */
    getOnePatientByName: async function (patientName) {
        const response = await db.query(`
            SELECT TOP 1 p.id, p.names FROM [patient] p
            WHERE LOWER(CONVERT(VARCHAR, p.names)) = '${patientName.toLowerCase()}';
        `)
        return response.recordset[0]
    },

    /**
     * Inserts one patient and assign a physiotherapist
     * @param {Types.Patient} patient
     * @param {Types.User["id"]} therapistId 
     * @returns {Promise<Types.Patient>} added user
     */
    createPatient: async function (patient, therapistId) {
        const response = await db.query(`
            INSERT INTO [patient] 
            (id, names, dateofbirth, physiotherapistId, height, weight, injuries, createdTimestamp)
            OUTPUT Inserted.id, Inserted.physiotherapistId, Inserted.createdTimestamp
            VALUES(NEWID(), '${patient.fullName}', '${patient.dateOfBirth}', '${therapistId}', '${patient.height}', '${patient.weight}', '${patient.injuries}', CURRENT_TIMESTAMP);
        `)
        return response.recordset[0]
    }
}
