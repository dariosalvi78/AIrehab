import * as Types from '../../../datamodel/modeljdocs.mjs'

let db = undefined

export const exercises = {
    init: async function (DB) {
        if (DB) {
            db = DB
            return exercises
        }
    },

    /**
     * Get all physiotherapy sessions
     * @returns {Promise<Array.<Types.PhysiotherapySession>>}
    */
    getSessions: async function () {
        const response = await db.query(`
            SELECT s.* FROM [physiotherapy_session] s
            ORDER BY s.startTimestamp DESC;
        `)
        return response.recordset
    },

    /**
     * Get all ongoing physiotherapy sessions assigned to a physiotherapist
     * @param {Types.User["email"]} therapistEmail 
     * @returns {Promise<Array.<Types.PhysiotherapySession>>}
    */
    getSessionsByEmail: async function (therapistEmail) {
        const response = await db.query(`
            SELECT s.*, p.names FROM [physiotherapy_session] s
            INNER JOIN [patient] p ON p.id = s.patientId
            INNER JOIN [user] u ON p.physiotherapistId = u.id
            WHERE u.email = '${therapistEmail}'
            ORDER BY s.startTimestamp DESC;
        `)
        return response.recordset
    },

    /**
     * Creates a new physiotherapy session for a patient
     * @param {Types.Patient["id"]} patientID 
     * @returns {Promise<Types.PhysiotherapySession>}
     */
    createSession: async function (patientID) {
        const response = await db.query(`
            INSERT INTO [physiotherapy_session]
            (id, patientId, startTimestamp, endTimestamp)
            OUTPUT Inserted.id, Inserted.patientId, Inserted.startTimestamp, Inserted.endTimestamp
            VALUES(NEWID(), '${patientID}', CURRENT_TIMESTAMP, NULL)
        `)
        return response.recordset[0]
    }
}
