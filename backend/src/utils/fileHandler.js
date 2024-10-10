
import * as Types from '../../../datamodel/modeljdocs.mjs'
import { mkdir } from 'fs/promises'
import fs from 'node:fs'
import logger from './logger.js'
import config from '../utils/config.js'
import formidable from 'formidable'
import exercises from '../DOM/exercisesCollection.js'

export default {
    /**
    * Save video from exercise in uploads folder
    * @param {Types.PhysiotherapySession["id"]} sessionID
    * @param {Types.Exercise["id"]} exerciseID
    * @param {Object} req contains form with video
    * @returns {Types.Exercise} exercise with updated video, endtimestamp 
    */
    async saveVideo(sessionID, exerciseID, req) {
        try {
            let filename = undefined
            const SESSION_DIR = config.uploads.base_path + '/session_' + sessionID

            if (!fs.existsSync(SESSION_DIR)) {
                await mkdir(SESSION_DIR, { recursive: true })
            }

            const form = formidable()
            return new Promise(async (resolve, reject) => {
                form.parse(req)
                form.on('error', async (err) => {
                    await exercises.updateExerciseVideo(exerciseID, { fileName: null, endTimestamp: null })
                    logger.error({ error: err }, 'Cannot save file: ')
                    reject(err)
                    return
                })
                form.on('fileBegin', async (formName, file) => {
                    if (!file) throw new Error('Error on saving file')
                    filename = file.newFilename + '_' + Date.now() + '.' + file.mimetype.slice(6)
                    file.filepath = SESSION_DIR + '/exercise_' + filename
                })
                form.on('end', async () => {
                    const exercise_with_video = await exercises.updateExerciseVideo(exerciseID, { fileName: filename, endTimestamp: 'CURRENT_TIMESTAMP' })
                    if (exercise_with_video) {
                        resolve(exercise_with_video)
                        return
                    }
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot save file')
        }
    },
    /**
     * Delete video associated with exercise
     * @param {Types.PhysiotherapySession["id"]} sessionID
     * @param {Types.Exercise["videoFile"]} filename
     */
    async deleteVideo(sessionID, filename) {
        try {
            const SESSION_DIR = config.uploads.base_path + '/session_' + sessionID
            let fullPath = SESSION_DIR + '/exercise_' + filename

            return new Promise(async (resolve, reject) => {
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) reject(err)
                    })
                    resolve(fullPath)
                }
                reject(`Found no file with the name: ${filename}`)
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot remove video: ')
            return
        }
    },
    /**
     * Remove folder associated with physiotherapy session
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     */
    async closeDirectory(sessionID) {
        try {
            const SESSION_DIR = config.uploads.base_path + '/session_' + sessionID
            return new Promise(async (resolve, reject) => {
                fs.readdir(SESSION_DIR, (err, files) => {    
                    if (!files || files.length <= 0) {
                        fs.rmdir(SESSION_DIR, (err) => {
                            if (err) reject(err)
                        })
                    }
                    resolve(SESSION_DIR)
                })
            })    
        } catch (err) {
            logger.error({ error: err }, 'cannot remove folder: ')
            return
        }
        
    }
}