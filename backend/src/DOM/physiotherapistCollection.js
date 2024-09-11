import db from '../db.js'
import * as Types from '../../../datamodel/modeljdocs.mjs'


/**
 * Get all patients for a specific physiotherapist
 * @param {Types.User["email"]} therapistEmail 
 * @returns {Promise<Array.<Types.Patient>>}
 */
async function getPatientsByEmail(therapistEmail) {
    const response = await db.query(`
        SELECT p.names, p.id as patientID FROM [user] u
        INNER JOIN [patient] p ON u.id = p.physiotherapistId
        WHERE u.email = '${therapistEmail}';
    `)
    return response.recordset
}

/**
 * Get one patient for a specific physiotherapist
 * @param {Types.User["email"]} therapistEmail 
 * @param {Types.Patient["id"]} patientID 
 * @returns {Promise<Types.Patient>}
 */
async function getOnePatientByEmail(therapistEmail, patientID) {
    const response = await db.query(`
        SELECT TOP 1 p.* FROM [patient] p
        INNER JOIN [user] u ON p.physiotherapistId = u.id
        WHERE p.id = '${patientID}'
        AND u.email = '${therapistEmail}';
    `)
    return response.recordset[0]
}

/**
 * Get one physiotherapist with given email
 * @param {Types.User["email"]} therapistEmail 
 * @returns {Promise<Types.User>}
 */
async function getOneTherapistByEmail(therapistEmail) {
    const response = await db.query(`
        SELECT TOP 1 u.* FROM [user] u
        WHERE u.email = '${therapistEmail}'
        AND u.role = 'physiotherapist';
    `)
    return response.recordset[0]
}

/**
 * Get one patient with given full name
 * @param {Types.Patient["names"]} patientName 
 * @returns {Promise<Types.Patient>}
 */
async function getOnePatientByName(patientName) {
    const response = await db.query(`
        SELECT TOP 1 p.id, p.names FROM [patient] p
        WHERE LOWER(CONVERT(VARCHAR, p.names)) = '${patientName.toLowerCase()}';
    `)
    return response.recordset[0]
}

/**
 * Inserts one patient and assign a physiotherapist
 * @param {Types.Patient} patient
 * @param {Types.User["id"]} therapistId 
 * @returns {Promise<Types.Patient>} added user
 */
async function createPatient(patient, therapistId) {
    const response = await db.query(`
        INSERT INTO [patient] 
        (id, names, dateofbirth, physiotherapistId, height, weight, injuries, createdTimestamp)
        OUTPUT Inserted.id, Inserted.physiotherapistId, Inserted.createdTimestamp
        VALUES(NEWID(), '${patient.fullName}', '${patient.dateOfBirth}', '${therapistId}', '${patient.height}', '${patient.weight}', '${patient.injuries}', CURRENT_TIMESTAMP);
    `)
    return response.recordset[0]
}

export default {
    getPatientsByEmail,
    getOnePatientByEmail,
    getOneTherapistByEmail,
    getOnePatientByName,
    createPatient
}