import * as Types from '../datamodel/modeljdocs.mjs'
import db from '../db/dbDriver.js'

export default {
    /**
     * Get POE results from exercise ID
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @returns {Promise<Array<Types.POEEvaluation>>}
     */
    getEvaluationsFromID: async function (exerciseID) {
        const response = await db.query(`
            DECLARE @exerciseID AS uniqueidentifier
            SET @exerciseID = '${exerciseID}'
            BEGIN
                SELECT 
                    poe.posturalOrientation,
                    poe.score,
                    poe.scoreConfidence_0,
                    poe.scoreConfidence_1,
                    poe.scoreConfidence_2,  
                    poe.repetition
                    FROM [poe_evaluation] poe
                WHERE poe.exerciseID = @exerciseID;
            END
            `)
        return response.recordset
    },

    /**
     * Update POE results from processed video
     * @param {Promise<Types.Exercise["id"]>} exerciseID
     * @returns {Promise<Types.POEEvaluation>} mock results, update later
     */
    updateEvaluationResults: async function (exerciseID, posturalOrientation, score, scoreConfidence_0, scoreConfidence_1, scoreConfidence_2, repetition) {
        const response = await db.query(`
            INSERT INTO [poe_evaluation] 
            (id, exerciseId, posturalOrientation, score, scoreConfidence_0, scoreConfidence_1, scoreConfidence_2, repetition)
            OUTPUT Inserted.id, Inserted.posturalOrientation, Inserted.score, Inserted.scoreConfidence_0, Inserted.scoreConfidence_1, Inserted.scoreConfidence_2, Inserted.repetition
            VALUES(NEWID(), '${exerciseID}', '${posturalOrientation}', ${score}, ${scoreConfidence_0}, ${scoreConfidence_1}, ${scoreConfidence_2}, ${repetition});
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
