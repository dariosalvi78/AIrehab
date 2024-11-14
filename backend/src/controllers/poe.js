
import * as Types from '../../../datamodel/modeljdocs.mjs'
import poe from "../DOM/poeCollection.js"
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import formidable from 'formidable'
import { mkdir } from 'fs/promises'
import fs from 'node:fs'
import config from '../utils/config.js'

import poeMA from '../utils/poeMotionAnalysis.js'

export default {

    /**
     * Get POE for given exercise
     * @param {Object} req - express request
     * @param {Object} req.params - exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.POEEvaluation>} POE with computed data
    */
    getPOEEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            if (!exerciseID) return res.sendStatus(400)
            const results = await poe.getEvaluationsFromID(exerciseID)
            if (!results.length) {
                const exercise = await exercises.getOneExerciseByEmail(exerciseID, req.user.email)

                // results are not available yet let's see if the evaluation is ongoing
                let isOngoing = await poeMA.isEvaluationOngoing(exercise.physiotherapySessionId, exerciseID, exercise.videoFile)
                if (isOngoing) {
                    res.sendStatus(204)
                    return
                }

                logger.debug({ exerciseID: exerciseID }, 'POEMA EVALUATION DONE, GETTING RESULTS')

                let poe_results = await poeMA.getLatestPOEAnalysis(exercise.physiotherapySessionId, exerciseID, exercise.videoFile)
                if (poe_results) {
                    for (let i = 0; i < poe_results.length; i++) {
                        await poe.updateEvaluationResults(
                            exerciseID,
                            poe_results[i].posturalOrientation,
                            poe_results[i].score,
                            poe_results[i].confidence0,
                            poe_results[i].confidence1,
                            poe_results[i].confidence2,
                            poe_results[i].repetition
                        )
                    }
                    res.send(poe_results)
                    return
                } else {
                    logger.error(null, 'No POE results available for user ' + exercise.patientID)
                }
            } else {
                res.send(results)
                return
            }
        } catch (err) {
            logger.error({ error: err }, 'error getting evaluation: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Send video for evaluation, but does not receive results immediately
     * @param {Object} req - express request
     * @param {Object} req.params exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.POEEvaluation>} mock poe results for exercise
     */
    sendVideoForPOEEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            const exercise = await exercises.getExerciseByID(exerciseID)
            if (!exercise) return res.status(404).send('Exercise does not exist')
            if (!exercise.videoFile) return res.status(400).send('Video does not exist')
            await poeMA.uploadVideo(exercise.id, exercise.physiotherapySessionId, exercise.videoFile, exercise.type);

            // await new Promise(res => setTimeout(res, 10000))
            return res.sendStatus(200)
        } catch (err) {
            logger.error({ error: err }, 'error sending POE: ')
            res.sendStatus(500)
            return
        }
    }
}