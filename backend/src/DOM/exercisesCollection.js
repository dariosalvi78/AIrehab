import * as Types from '../../../datamodel/modeljdocs.mjs'
import db from '../db/dbDriver.js'

export default {
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
    * Get one exercise for a specific physiotherapy session
    * @param {Types.Exercise["id"]} exerciseID
    * @returns {Promise<Types.Exercise>}
    */
    getExerciseByID: async function (exerciseID) {
        const response = await db.query(`
            SELECT TOP 1 e.* FROM [exercise] e
            WHERE e.id = '${exerciseID}';
        `)
        return response.recordset[0]
    },

     /**
     * Get one exercise by physiotherapist email
     * @param {Types.Exercise["id"]} exerciseID
     * @param {Types.User["email"]} therapistEmail 
     * @returns {Promise<Types.Exercise>}
     */
     getOneExerciseByEmail: async function (exerciseID, therapistEmail) {
        const response = await db.query(`
            SELECT TOP 1 e.*, u.email AS physiotherapistEmail FROM [exercise] e
            INNER JOIN [physiotherapy_session] s ON e.physiotherapySessionId = s.id
            LEFT JOIN [patient] p ON s.patientId = p.id
            LEFT JOIN [user] u ON p.physiotherapistId = u.id
            WHERE u.email = '${therapistEmail}'
            AND e.id = '${exerciseID}';
        `)
        return response.recordset[0]
    },

    /**
     * Get all exercises for a specific session and physiotherapist
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     * @returns {Promise<Array.<Types.Exercise>>}
     */
    getExercisesBySession: async function (sessionID) {
        const response = await db.query(`
            SELECT e.* FROM [exercise] e
            INNER JOIN [physiotherapy_session] s ON e.physiotherapySessionId = s.id
            INNER JOIN [patient] p ON p.id = s.patientId
            WHERE s.id = '${sessionID}'
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
            (id, startTimestamp, physiotherapySessionId, type, notes)
            OUTPUT Inserted.id, Inserted.startTimestamp, Inserted.physiotherapySessionId, Inserted.type, Inserted.notes
            VALUES(NEWID(), CURRENT_TIMESTAMP, '${sessionID}', '${exercise.type}', '${exercise.notes}');
        `)
        return response.recordset[0]
    },

    /**
     * Delete one exercise for given physiotherapy session
     * @param {Types.Exercise["id"]} exerciseID 
     */
    deleteOneExercise: async function (exerciseID) {
        const response = await db.query(`
            DELETE e FROM [exercise] AS e
            INNER JOIN [physiotherapy_session] s ON s.id = e.physiotherapySessionId
            WHERE e.id = '${exerciseID}';
        `)
        return response
    },

    /**
     * Update finished exercise with video and end timestamp
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @param {Object} video fileName, endTimestamp
     * @returns {Promise<Types.Exercise>} video with new timestamp
     */
    updateExerciseVideo: async function (exerciseID, video) {
        const response = await db.query(`
            UPDATE e SET 
            videoFile = '${video.fileName}',
            endTimestamp = ${video.endTimestamp}
            OUTPUT Inserted.videoFile, Inserted.endTimestamp
            FROM [exercise] e
            WHERE e.id = '${exerciseID}';
        `)
        return response.recordset[0]
    },

    /**
     * Updates one exercise with new data
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @param {Types.Exercise} exercise new exercise data
     */
    updateOneExercise: async function (exerciseID, exercise) {
        const response = await db.query(`
            UPDATE e SET 
            type = '${exercise.type}', 
            notes = '${exercise.notes}'
            OUTPUT Inserted.type, Inserted.notes
            FROM [exercise] e
            WHERE e.id = '${exerciseID}';
        `)
        return response.recordset[0]
    },
}
