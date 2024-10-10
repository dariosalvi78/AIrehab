
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
            let results = await poe.getEvaluationFromID(exerciseID)

            if (!results) {
                // TODO: get user ID from the exercise ID
                let userId = 'XXXXX'
                // results are not available yet let's see if the evaluation is ongoing
                let isOngoing = await poeMA.isEvaluationOngoing(userId)

                if (isOngoing) {
                    res.sendStatus(102)
                    return
                } else {
                    let latestResults = await poeMA.getLatestPOEAnalysis(userId)
                    if (latestResults) {
                        res.send(latestResults)
                        return
                    } else {
                        logger.error(null, 'No POE results available for user ' + userId)
                    }
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
            await poeMA.uploadVideo(exercise.videoFile);
            return res.sendStatus(200)
        } catch (err) {
            logger.error({ error: err }, 'error sending POE: ')
            res.sendStatus(500)
            return
        }
    }
}