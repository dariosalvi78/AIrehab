
import * as Types from '../../../datamodel/modeljdocs.mjs'
import poe from "../DOM/poeCollection.js"
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import formidable from 'formidable'
import { mkdir } from 'fs/promises'
import fs from 'node:fs'
import config from '../utils/config.js'

export default {

    /**
     * Get POE for given exercise
     * @param {Object} req - express request
     * @param {Object} req.params exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.POEEvaluation>} POE with computed data
    */
    getEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            if (!exerciseID) return res.sendStatus(400)
            let results = await poe.getEvaluationFromID(exerciseID)
            res.send(results)
            return
        } catch (err) {
            logger.error({ error: err }, 'error getting evaluation: ')
            res.sendStatus(500)
            return
        }
    },

    /**
     * Send video for evaluation, updates poe results
     * @param {Object} req - express request
     * @param {Object} req.params exerciseID
     * @param {Object} res - express response
     * @returns {Promise<Types.POEEvaluation>} mock poe results for exercise
     */
    sendEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let exerciseID = req.params.exerciseID
        try {
            const exercise = await exercises.getExerciseByID(exerciseID)
            if (!exercise) return res.status(404).send('Exercise does not exist')
            if (!exercise.videoFile) return res.status(400).send('Video does not exist')

            // TODO: get POE from algorithms in a separate call
            // TODO: save the POE results in the table in a separate call
            // poe.sendVideoForEvaluation()
            await new Promise(res => setTimeout(res, 10000))
            const poe_results = await poe.updateEvaluationResults(exerciseID)
            return res.send(poe_results)
        } catch (err) {
            logger.error({ error: err }, 'error sending POE: ')
            res.sendStatus(500)
            return
        }
    }
}