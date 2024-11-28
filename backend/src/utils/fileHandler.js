
import * as Types from '../datamodel/modeljdocs.mjs'
import { mkdir, rm } from 'fs/promises'
import fs from 'node:fs'
import { fileTypeFromFile } from 'file-type'
import logger from './logger.js'
import config from '../utils/config.js'
import formidable, { errors as formidableErrors } from 'formidable'
import exercises from '../DOM/exercisesCollection.js'
import sessions from '../DOM/physiotherapySessionCollection.js'

export default {
    /**
    * Save video from exercise in uploads folder
    * @param {Types.PhysiotherapySession["id"]} sessionID
    * @param {Types.Exercise["id"]} exerciseID
    * @param {Object} req contains form with video
    * @returns {Types.Exercise} exercise with updated video, endtimestamp 
    */
    async saveVideo (sessionID, exerciseID, req) {
        try {
            let filename = undefined
            const SESSION_DIR = config.uploads.base_path + 'session_' + sessionID + '/exercise_' + exerciseID

            if (!fs.existsSync(SESSION_DIR)) {
                await mkdir(SESSION_DIR, { recursive: true })
            }
            let maxSizeInMB = 80, fileSizeLimit = (maxSizeInMB * 1024 * 1024)
            const form = formidable({ maxFieldsSize: fileSizeLimit, maxFileSize: fileSizeLimit, maxFiles: 1, allowEmptyFiles: false })
            return new Promise(async (resolve, reject) => {
                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        await exercises.updateExerciseVideo(exerciseID, { fileName: null, endTimestamp: null })
                        await new Promise(res => setTimeout(res, 2000))
                        return reject({
                            exerciseID,
                            reason: err.httpCode == 413
                                ? `File is too large, ${maxSizeInMB} MB limit on uploads`
                                : 'Uploaded file could not be saved',
                            ...err
                        })
                    }

                    if (!files) throw new Error('Error on saving file')
                    let file = files.uploaded_file[0]

                    let fileType = await fileTypeFromFile(file.filepath)
                    if (fileType.mime !== file.mimetype) return reject({ exerciseID, httpCode: 400, reason: 'Could not parse uploaded file type' })

                    filename = file.newFilename + '_' + Date.now() + '.' + fileType.ext
                    const exercise_file_path = SESSION_DIR + '/vid_' + filename

                    fs.copyFile(file.filepath, exercise_file_path, async (err) => {
                        if (err) return reject({ exerciseID, error: err.message })

                        logger.info({ exerciseID, file: filename }, 'File uploaded')
                        await rm(file.filepath, { recursive: true }) // remove copy from /temp folder

                        const exercise_with_video = await exercises.updateExerciseVideo(exerciseID, { fileName: `'${filename}'`, endTimestamp: 'CURRENT_TIMESTAMP' })
                        await sessions.updateSessionTimestamp(sessionID, `'${new Date().toISOString()}'`)
                        if (exercise_with_video) {
                            resolve(exercise_with_video)
                            return
                        }
                    })
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot save file')
            return
        }
    },
    /**
     * Delete video and data associated with exercise
     * @param {Types.PhysiotherapySession["id"]} sessionID
     * @param {Types.Exercise["id"]} exerciseID
     * @param {Types.Exercise["videoFile"]} filename
     */
    async deleteVideo (sessionID, exerciseID, filename) {
        try {
            const EXERCISE_DIR = config.uploads.base_path + '/session_' + sessionID + '/exercise_' + exerciseID
            let fullPath = EXERCISE_DIR + '/vid_' + filename

            return new Promise(async (resolve, reject) => {
                if (fs.existsSync(fullPath)) {
                    fs.rm(EXERCISE_DIR, { recursive: true }, (err) => {
                        if (err) reject(err)
                    })
                    return resolve(fullPath)
                }
                logger.error({ filePath: fullPath, exerciseID: exerciseID }, 'Tried to delete file but did not find it')
                return resolve()
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot remove video: ')
            return
        }
    },
    /**
     * Remove folder associated with session
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     */
    async closeDirectory (sessionID) {
        try {
            const SESSION_DIR = config.uploads.base_path + '/session_' + sessionID
            return new Promise(async (resolve, reject) => {
                fs.readdir(SESSION_DIR, (err, files) => {
                    fs.rm(SESSION_DIR, { recursive : true }, (err) => {
                        if (err) reject(err)
                    })
                    logger.debug({ directory: files, sessionID: sessionID }, 'Deleted session directory')
                    return resolve(SESSION_DIR)
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot remove folder: ')
            return
        }
    },
    /**
     * Rename file from uploads directory
     * @param {Types.PhysiotherapySession["id"]} sessionID 
     * @param {Types.Exercise["id"]} exerciseID 
     * @param {String} oldFileName 
     * @param {String} newFileName
     * @returns
     */
    async renameFile (sessionID, exerciseID, oldFileName, newFileName) {
        try {
            const SESSION_DIR = config.uploads.base_path + 'session_' + sessionID
            let fullPath = SESSION_DIR + '/exercise_' + exerciseID + '/vid_', oldFilePath = fullPath + oldFileName

            return new Promise(async (resolve, reject) => {
                fs.readdir(SESSION_DIR, async (err, files) => {
                    if (err) reject(err)
                    const file = await fileTypeFromFile(oldFilePath)
                    let updatedFileName = newFileName + '.' + file.ext

                    fs.renameSync(oldFilePath, fullPath + updatedFileName)
                    return resolve(updatedFileName)
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot rename file: ')
            return
        }
    },
    /**
     * Saves file containing task id of video that is being analysed
     * @param {String} dirToExercise 
     * @param {String} taskID 
     */
    async createTaskFile (dirToExercise, taskID) {
        try {
            const fileName = config.uploads.base_path + dirToExercise + '/.env.task_id'
            return new Promise(async (resolve, reject) => {
                fs.writeFile(fileName, `TASK_ID=${taskID}`, (err) => {
                    if (err) reject(err)
                    logger.debug({ data: fileName }, 'saved task file ')
                    resolve(fileName)
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot save task file: ')
            return
        }
    },
    /**
     * Get task id from file for retrieving ongoing status
     * @param {String} dirToExercise 
     * @returns {String} Task ID for exercise
     */
    async getOngoingTask (dirToExercise) {
        try {
            const fileName = config.uploads.base_path + dirToExercise + '/.env.task_id'
            return new Promise(async (resolve, reject) => {
                fs.readFile(fileName, { encoding: 'utf-8' }, (err, data) => {
                    if (err) reject(err)
                    let parseData = data.split('TASK_ID=')[1]
                    return resolve(parseData)
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot get task file: ')
            return
        }
    },
    /**
     * Get results from video associated with exercise
     * @param {String} dirToExercise
     * @param {Types.Exercise["videoFile"]} filename
     * @returns {Promise<Array<Types.POEEvaluation>>} POE results
    */
    async getAnalysedVideo (dirToExercise, videoFilename) {
        try {
            if (config.poe.runModel === 'false') return (await import('../../tests/mock_data.js')).default.poe_results
            const fileName = config.uploads.base_path + dirToExercise + '/vid_' + videoFilename.replace('.mp4', '.json')
            return new Promise(async (resolve, reject) => {
                fs.readFile(fileName, { encoding: 'utf-8' }, (err, data) => {
                    if (err) reject(err)
                    let parsedJSONData = JSON.parse(data)
                    return resolve(parsedJSONData)
                })
            })
        } catch (err) {
            logger.error({ error: err }, 'cannot get poe results from video: ')
            return
        }
    }
}