import * as Types from '../../datamodel/modeljdocs.mjs'
import db from '../db/dbDriver.js'

export default {
    /**
     * Get all patients, only used by admin
     * @returns {Promise<Array.<Types.Patient>>}
     */
    getPatients: async function () {
        const response = await db.query(`
            SELECT p.* FROM [patient] p
            ORDER BY p.createdTimestamp DESC;
        `)
        return response.recordset
    },
    /**
     * Get all patients for a specific physiotherapist
     * @param {Types.User["email"]} therapistEmail 
     * @param {Object} pagination limit, pageNo, sortOrder
     * @returns {Promise<Array.<Types.Patient>>}
     */
    getPatientsByEmail: async function (therapistEmail, pagination) {
        const response = await db.query(`
            DECLARE @pageNo AS INT
            DECLARE @maxPage AS FLOAT
            SET @pageNo=${pagination.pageNo}
            SELECT @maxPage = COUNT(p.id) FROM [patient] p 
                INNER JOIN [user] u ON p.physiotherapistId = u.id
                WHERE u.email = '${therapistEmail}'
            SET @maxPage = CEILING(@maxPage/${pagination.limit})
            WHILE @maxPage >= @pageNo
            BEGIN
                SELECT 
                    CAST(p.names AS NVARCHAR(100)) as names,  
                    p.id as patientID, 
                    p.createdTimestamp,
                    CASE WHEN COUNT(s.id) >= 1 THEN 1 ELSE 0 END AS isPartOfSession
                FROM [user] u
                    INNER JOIN [patient] p ON u.id = p.physiotherapistId
                    LEFT JOIN [physiotherapy_session] s ON p.id = s.patientId
                WHERE u.email = '${therapistEmail}'
                GROUP BY 
                    CAST(p.names AS NVARCHAR(100)), 
                    p.id, 
                    p.createdTimestamp
                ORDER BY
                    ${pagination.type == 'date'
                ? `p.createdTimestamp ${pagination.date.sortOrder}`
                : `CAST(p.names AS NVARCHAR(100)) ${pagination.name.sortOrder}`
            }
                OFFSET (@pageNo-1) * ${pagination.limit} ROWS
                FETCH NEXT ${pagination.limit} ROWS ONLY
                SET @pageNo = @pageNo + 1
            END
            SELECT @maxPage AS maxPage
        `)
        return response.recordsets
    },
    /**
     * Get one patient for a specific physiotherapist
     * @param {Types.User["email"]} therapistEmail 
     * @param {Types.Patient["id"]} patientID 
     * @returns {Promise<Types.Patient>}
     */
    getOnePatientByEmail: async function (therapistEmail, patientID) {
        const response = await db.query(`
            SELECT TOP 1 p.*, u.email AS therapistEmail, s.id AS sessionID FROM [patient] p
            INNER JOIN [user] u ON p.physiotherapistId = u.id
            LEFT JOIN [physiotherapy_session] s ON p.id = s.patientId
            WHERE p.id = '${patientID}'
            AND u.email = '${therapistEmail}';
        `)
        return response.recordset[0]
    },

    /**
    * Get one patient by ID for a specific physiotherapist
    * @param {Types.Patient["id"]} patientID 
    * @returns {Promise<Types.Patient>}
    */
    getOnePatientByID: async function (patientID) {
        const response = await db.query(`
            SELECT TOP 1 p.*, u.email AS physiotherapistEmail, s.id AS sessionID FROM [patient] p
            RIGHT JOIN [user] u ON p.physiotherapistId = u.id
            LEFT JOIN [physiotherapy_session] s ON p.id = s.patientId
            WHERE p.id = '${patientID}'
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
            SELECT TOP 1 u.*, COUNT(p.id) AS numOfPatients FROM [user] u
            LEFT JOIN [patient] p ON p.physiotherapistId = u.id
            WHERE u.email = '${therapistEmail}'
            AND u.role = 'physiotherapist'
            GROUP BY u.email, u.id, u.hashedPassword, u.role, u.createdTimestamp, u.lastloginTimestamp;
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
            (id, names, dateofbirth, physiotherapistId, height, weight, injuries, injuredSide, injuredBodyPart, createdTimestamp)
            OUTPUT Inserted.id, Inserted.physiotherapistId, Inserted.createdTimestamp
            VALUES(
                NEWID(),
                '${patient.fullName}', 
                '${patient.dateOfBirth}', 
                '${therapistId}',
                ${patient.height}, 
                ${patient.weight}, 
                '${patient.injuries.description}',
                '${patient.injuries.injuredSide}',
                '${patient.injuries.injuredBodyPart}',
                CURRENT_TIMESTAMP
                );
        `)
        return response.recordset[0]
    },

    /**
     * Delete one patient, also removed for physiotherapist
     * @param {Types.User["id"]} therapistId 
     * @param {Types.Patient["id"]} patientID 
     */
    deleteOnePatient: async function (therapistId, patientID) {
        const response = await db.query(`
            DELETE p FROM [patient] AS p
            INNER JOIN [user] AS u ON p.physiotherapistId = u.id
            WHERE p.id = '${patientID}'
            AND u.id = '${therapistId}';
        `)
        return response
    },

    /**
     * Updates one patient with new data
     * @param {Types.Patient} patient
     * @param {Types.User["id"]} patientID 
     */
    updateOnePatient: async function (patient, patientID) {
        const response = await db.query(`
            UPDATE p SET 
            names = '${patient.fullName}', 
            dateofbirth = '${patient.dateOfBirth}', 
            height = ${patient.height},
            weight = ${patient.weight},
            injuries = '${patient.injuries.description}',
            injuredSide = '${patient.injuries.injuredSide}',
            injuredBodyPart = '${patient.injuries.injuredBodyPart}'
            FROM [patient] p
            WHERE p.id = '${patientID}';
        `)
        return response
    },
}
