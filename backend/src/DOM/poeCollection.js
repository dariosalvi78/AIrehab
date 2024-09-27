import * as Types from '../../../datamodel/modeljdocs.mjs'
import db from '../db/dbDriver.js'

export default {
    /**
     * Get POE from exercise
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @param {Promise<Types.Exercise["physiotherapySessionId"]>} sessionID
     * @returns {Promise<Types.POEEvaluation>}
     */
    getEvaluationFromID: async function (exerciseID, sessionID) {
        const response = await db.query(`
            SELECT poe.*, e.videoFile FROM [poe_evaluation] poe
            INNER JOIN [exercise] e ON poe.exerciseID = e.id
            WHERE poe.exerciseID = '${exerciseID}'
            AND e.physiotherapySessionId = '${sessionID}';
        `)
        return response.recordset[0]
    },

    /**
     * Send video for POE
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @returns {Promise<Types.POEEvaluation>} mock results, update later
     */
    sendEvaluation: async function (exerciseID) {
        const response = await db.query(`
            INSERT INTO [poe_evaluation] 
            (id, exerciseId, posturalOrientation, score, scoreConfidence_0, scoreConfidence_1, scoreConfidence_2, repetition)
            OUTPUT Inserted.id, Inserted.posturalOrientation, Inserted.score, Inserted.scoreConfidence_0, Inserted.scoreConfidence_1, Inserted.scoreConfidence_2, Inserted.repetition
            VALUES(NEWID(), '${exerciseID}', 'kneeMedialToFootPosition', 1, 87.5, 0, 0, 0);
        `)
        return response.recordset
    },

    /**
     * Update exercise with video and timestamp
     * @param {Promise<Types.Exercise["physiotherapySessionId"]>} sessionID
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @param {Promise<Types.Exercise["videoFile"]>} videoFile
     * @returns {Promise<Types.POEEvaluation>}
     */
    updateExerciseVideo: async function (sessionID, exerciseID, videoFile) {
        const response = await db.query(`
            UPDATE e SET 
            videoFile = '${videoFile}',
            endTimestamp = CURRENT_TIMESTAMP
            OUTPUT Inserted.videoFile
            FROM [exercise] e
            WHERE e.id = '${exerciseID}'
            AND e.physiotherapySessionId = '${sessionID}';
        `)
        return response.recordset[0]
    },

    /**
     * Delete POE results for given exercise
     * @param {Types.Exercise["id"]} exerciseID 
     */
      deletePOEForExerciseByID: async function (exerciseID) {
        const response = await db.query(`
            DELETE poe FROM [poe_evaluation] AS poe
            INNER JOIN [exercise] e ON poe.exerciseID = e.id
            WHERE e.id = '${exerciseID}';
        `)
        return response
    }
}
