
import * as Types from '../../../datamodel/modeljdocs.mjs'
import exercises from "../DOM/exercisesCollection.js"
import logger from "../utils/logger.js"
import formidable from 'formidable'
import { mkdir } from 'fs/promises'
import fs from 'node:fs'

export default {

    sendEvaluation: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        let body = req.body, exerciseID = req.params.exerciseID
        console.log('body', body)
        // console.log('file', req.file)
        try {
            const exercise = await exercises.getExerciseByID(exerciseID)
            if (!exercise) return res.status(404).send('Exercise does not exist')

            let filename = undefined
            let directory = 'uploads'

            if (!fs.existsSync(directory)) {
                await mkdir(directory, { recursive: true })
            }

            const form = formidable()
            return new Promise(async (resolve, reject) => {
                form.parse(req)
                form.on('error', (err) => {
                    logger.error({ error: err }, 'Cannot save file: ')
                    res.sendStatus(500)
                    reject()
                    return
                })
                form.on('fileBegin', (formName, file) => {
                    if (!file) return res.sendStatus(400)
                        filename = exerciseID + '_' + Date.now() + '.' + 'webm'
                        file.filepath = directory + '/' + filename
                })
                form.on('end', () => {
                    res.sendStatus(200)
                    resolve()
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'error getting evaluation: ')
            res.sendStatus(500)
            return
        }
    }
}