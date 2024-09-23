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
     * Get all exercises
     * @returns {Promise<Array.<Types.Exercise>>}
     */
    getExercises: async function () {
        const response = await db.query(`
            SELECT e.* FROM [exercise] e
            ORDER BY e.startTimestamp DESC;
        `)
        return response.recordset
    },

    /**
     * Get all exercises for a specific session and physiotherapist
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     * @param {Types.User["id"]} therapistID 
     * @returns {Promise<Array.<Types.Exercise>>}
     */
    getExercisesBySession: async function (sessionID, therapistID) {
        const response = await db.query(`
            SELECT e.* FROM [exercise] e
            INNER JOIN [physiotherapy_session] s ON e.physiotherapySessionId = s.id
            INNER JOIN [patient] p ON p.id = s.patientId
            WHERE p.physiotherapistId = '${therapistID}'
            AND s.id = '${sessionID}'
            ORDER BY e.startTimestamp DESC;
        `)
        return response.recordset
    },

    /**
     * Adds one exercise to an existing physiotherapy session
     * @param {Types.PhysiotherapySession["id"]} sessionID
     * @param {Types.Exercise} exercise 
     * @returns {Promise<Types.Exercise>} added exercise
     */
    createExercise: async function (sessionID, exercise) {
        const response = await db.query(`
            INSERT INTO [exercise] 
            (id, startTimestamp, endTimestamp, physiotherapySessionId, type, videoFile, notes)
            OUTPUT Inserted.id, Inserted.startTimestamp, Inserted.endTimestamp, Inserted.physiotherapySessionId, Inserted.type, Inserted.videoFile, Inserted.notes
            VALUES(NEWID(), '${exercise.startTimestamp}', ${exercise.endTimestamp ? `'${exercise.endTimestamp}'` : null}, '${sessionID}', '${exercise.type}', '${exercise.videoFile}', '${exercise.notes}');
        `)
        return response.recordset[0]
    },

    /**
     * Delete one exercise for given physiotherapy session
     * @param {Types.Exercise["id"]} exerciseID 
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     */
    deleteOneExercise: async function (exerciseID, sessionID) {
        const response = await db.query(`
            DELETE e FROM [exercise] AS e
            INNER JOIN [physiotherapy_session] s ON s.id = e.physiotherapySessionId
            WHERE e.id = '${exerciseID}'
            AND s.id = '${sessionID}';
        `)
        return response
    }
}
