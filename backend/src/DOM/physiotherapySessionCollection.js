import * as Types from '../../../datamodel/modeljdocs.mjs'
import db from '../db/dbDriver.js'

export default {
    /**
     * Get all physiotherapy sessions
     * @returns {Promise<Array.<Types.PhysiotherapySession>>}
    */
    getSessions: async function () {
        const response = await db.query(`
            SELECT
                s.id AS sessionID,
                s.startTimestamp AS sessionStartTimestamp,
                s.patientId,
                COUNT(e.id) AS numOfExercises
            FROM [physiotherapy_session] s
                LEFT JOIN [exercise] e ON s.id = e.physiotherapySessionId
            GROUP BY
                s.id,
                s.patientId,
                s.startTimestamp
            ORDER BY s.startTimestamp DESC;
        `)
        return response.recordset
    },

    /**
     * Get all ongoing physiotherapy sessions assigned to a physiotherapist
     * @param {Types.User["email"]} therapistEmail
     * @param {Object} pagination limit, pageNo, sortOrder
     * @returns {Promise<Array.<Types.PhysiotherapySession>>}
    */
    getSessionsByEmail: async function (therapistEmail, pagination) {
        const response = await db.query(`
            DECLARE @pageNo AS INT
            DECLARE @maxPage AS FLOAT
            SET @pageNo=${pagination.pageNo}
            SELECT @maxPage = COUNT(s.id) FROM [physiotherapy_session] s 
            SET @maxPage = CEILING(@maxPage/${pagination.limit})
            WHILE @maxPage >= @pageNo
            BEGIN
                SELECT s.id,
                    s.startTimestamp, 
                    s.endTimestamp, 
                    CAST(p.names AS NVARCHAR(100)) names, 
                    COUNT(e.id) AS numOfExercises 
                FROM [physiotherapy_session] s
                    INNER JOIN [patient] p ON p.id = s.patientId
                    INNER JOIN [user] u ON p.physiotherapistId = u.id
                    LEFT JOIN [exercise] e ON s.id = e.physiotherapySessionId
                WHERE u.email = '${therapistEmail}'
                GROUP BY 
                    s.id, 
                    s.startTimestamp, 
                    s.endTimestamp, 
                    CAST(p.names AS NVARCHAR(100))
                ORDER BY s.startTimestamp ${pagination.sortOrder}
                OFFSET (@pageNo-1) * ${pagination.limit} ROWS
                FETCH NEXT ${pagination.limit} ROWS ONLY
                SET @pageNo = @pageNo + 1
            END
            SELECT @maxPage AS maxPage
        `)
        return response.recordsets
    },

    /**
    * Get one session for a specific patient
    * @param {Types.PhysiotherapySession["id"]} sessionID 
    * @param {Types.User["email"]} therapistEmail 
    * @returns {Promise<Types.PhysiotherapySession>}
    */
    getSessionByID: async function (sessionID, therapistEmail) {
        const response = await db.query(`
            SELECT s.*, p.names AS patientName FROM [physiotherapy_session] s
            INNER JOIN [patient] p ON p.id = s.patientId
            INNER JOIN [user] u ON p.physiotherapistId = u.id
            WHERE u.email = '${therapistEmail}'
            AND s.id = '${sessionID}'
            ORDER BY s.startTimestamp DESC;
        `)
        return response.recordset[0]
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
    },

    /**
     * Delete one session
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     */
    deleteOneSession: async function (sessionID) {
        const response = await db.query(`
            DELETE s FROM [physiotherapy_session] AS s
            WHERE s.id = '${sessionID}';
        `)
        return response
    }
}
