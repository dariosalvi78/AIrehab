
import * as Types from '../../../datamodel/modeljdocs.mjs'
import { mkdir, rm } from 'fs/promises'
import fs from 'node:fs'
import { fileTypeFromFile } from 'file-type'
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
            const SESSION_DIR = config.uploads.base_path + 'session_' + sessionID

            if (!fs.existsSync(SESSION_DIR)) {
                await mkdir(SESSION_DIR, { recursive: true })
            }
            let fileSizeLimit = 80 * 1024 * 1024 // 80 MB limit
            const form = formidable({ maxFieldsSize: fileSizeLimit, maxFileSize: fileSizeLimit })
            return new Promise(async (resolve, reject) => {
                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        await exercises.updateExerciseVideo(exerciseID, { fileName: null, endTimestamp: null })
                        return reject({ exerciseID, ...err })
                    }

                    if (!files) throw new Error('Error on saving file')
                    let file = files.uploaded_file[0]

                    let fileType = await fileTypeFromFile(file.filepath)
                    if (fileType.mime !== file.mimetype) return reject({ exerciseID, httpCode: 400, error: 'Could not parse uploaded file type' })

                    filename = file.newFilename + '_' + Date.now() + '.' + fileType.ext
                    const exercise_file_path = SESSION_DIR + '/exercise_' + filename

                    fs.copyFile(file.filepath, exercise_file_path, async (err) => {
                        if (err) return reject({ exerciseID, error: err.message })

                        logger.info({ exerciseID, file: filename }, 'File uploaded')
                        await rm(file.filepath, { recursive: true }) // remove copy from /temp folder

                        const exercise_with_video = await exercises.updateExerciseVideo(exerciseID, { fileName: `'${filename}'`, endTimestamp: 'CURRENT_TIMESTAMP' })
                        if (exercise_with_video) {
                            resolve(exercise_with_video)
                            return
                        }
                    })
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