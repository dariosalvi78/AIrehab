import * as Types from '../../../datamodel/modeljdocs.mjs'
import axios from 'axios'
import logger from './logger.js';
import config from './config.js';
import fileHandler from './fileHandler.js';

const POE_SERVER_URL = `http://${config.poe.base_url}:${config.poe.port}` 

export default {

    // simulation only:
    videoSentTimestamp: undefined,

    /**
     * Creates a user on the AI POE server
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     * @param {Types.Patient["height"]} length - length of subject in cm
     * @param {Types.Patient["weight"]} weight - weight in kg
     */
    async createUser(userId, length, weight) {
        try {
            const form = new FormData()
            form.append('id', userId)
            form.append('length', length)
            form.append('weight', weight)
            let resp = await axios.post(`${POE_SERVER_URL}/create_user`, form, 
                { headers: { "Content-Type": 'multipart/form-data' } 
            })
            logger.debug({ patientID: userId }, 'POE MA user created')
            return resp.data
        } catch (err) {
            logger.error({ reason: err.code, patientID: userId }, 'Cant create user on POEMA')
            return
        }
    },

    /**
     * Deletes user on the AI POE server
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     */
    async deleteUser(userId) {
        try {
            let resp = await axios.delete(`${POE_SERVER_URL}/delete_user/${userId}`)
            logger.debug({ patientID: userId }, 'Deleted POE MA user')
            return resp.status
        } catch (err) {
            logger.error({ reason: err.code, patientID: userId }, 'Cant delete user on POEMA')
            return
        }
    },

    /**
     * Uploads the video file to the AI POE server
     * @param {Types.Exercise["id"]} exerciseID - exercise ID as we have it on the application server
     * @param {Types.Exercise["physiotherapySessionId"]} sessionID
     * @param {Types.Exercise["videoFile"]} videoFilename - video file local on the server
     * @param {Types.Exercise["type"]} exerciseType -  "singleLeggedSquatLeft" or "singleLeggedSquatRight", mapped to "L" or "R"
     * @returns {Promise<Boolean>}
     */
    async uploadVideo (exerciseID, sessionID, videoFilename, exerciseType) {
        if (config.poe.runModel) {
            const SESSION_DIR = 'session_' + sessionID + '/exercise_' + exerciseID
            const VIDEO_PATH = SESSION_DIR + '/vid_' + videoFilename
            try {
                let leg = exerciseType == 'singleLeggedSquatLeft' ? 'L' : 'R'
                let resp = await axios.post(`${POE_SERVER_URL}/analyse_video?path=${VIDEO_PATH}&leg=${leg}`, 
                    { headers: { "Content-Type": 'application/json' } 
                })
                logger.info({ exerciseID: exerciseID }, 'UPLOADED VIDEO ON POEMA')
                console.log(resp)
                if (resp) {
                    // we need to know the ID of the task in order to see ongoing status
                    const TASK_ID = (/\(*([a-f0-9\\-]*)\s*\)/g).exec(resp.data)[1]
                    await fileHandler.createTaskFile(SESSION_DIR, TASK_ID)
                    return
                }
            } catch (err) {
                logger.error({ reason: err.code, exerciseID: exerciseID }, 'cannot upload video on POEMA')
                return
            }
        } else {
            logger.debug('UPLOADED VIDEO ON POEMA', exerciseID)
            this.videoSentTimestamp = new Date()
            return true;
        }
    },

    /**
     * Tells if a video is being analyzed
     * @param {Types.Exercise["id"]} exerciseID - exercise ID as we have it on the application server
     * @param {Types.Exercise["physiotherapySessionId"]} sessionID
     * @param {Types.Exercise["videoFile"]} videoFilename - video file local on the server
     * @returns {Promise<Boolean>}
     */
    async isEvaluationOngoing (sessionID, exerciseID, videoFilename) {
        if (config.poe.runModel) {
            try {
                const SESSION_DIR = 'session_' + sessionID + '/exercise_' + exerciseID
                const TASK_ID = await fileHandler.getOngoingTask(SESSION_DIR)

                let resp = await axios.get(`${POE_SERVER_URL}/ongoing?id=${TASK_ID}`)
                return resp.status === 201 ? false : true              
            } catch (err) {
                logger.error({ error: err }, 'cannot get ongoing POEMA status')
                return
            }
        } else {
            if (!this.videoSentTimestamp) return false
            if (new Date().getTime() - this.videoSentTimestamp.getTime() > 10000) {
                this.videoSentTimestamp = null
                return false
            }
            else return true
        }
    },  

    /**
     * Retrieves the POE analysis for the latest uploaded video
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     * @returns {Promise<Array<Types.POEEvaluation>>}
     */
    async getLatestPOEAnalysis (sessionID, exerciseID, filename) {
        const SESSION_DIR = 'session_' + sessionID + '/exercise_' + exerciseID
        let returned_poe_obj = await fileHandler.getAnalysedVideo(SESSION_DIR, filename)

        /**
         * Array of POEEvaluation
         */
        let returnedValue = []

        // adapt returned results from the API into the POEEvaluation
        for (const type in returned_poe_obj) {
            console.log(returned_poe_obj[type])
            returnedValue.push({
                posturalOrientation: this.mapPosturalOrientation(type), //'trunk', 'hip', 'femoralValgus', 'kneeMedialToFootPosition'
                repetition: 0, // summative or "combined"
                score: returned_poe_obj[type].pred, // can be 0=good (bra), 1=fair (nedsatt), 2=poor (dåligt),
                confidence0: returned_poe_obj[type].conf[0], // score is based on index with highest confidence
                confidence1: returned_poe_obj[type].conf[1], 
                confidence2: returned_poe_obj[type].conf[2],
            })
        }

        return returnedValue;
    },

    /**
     * @returns {Types.POEEvaluation["posturalOrientation"]}
     */
    mapPosturalOrientation (orient) {
        if (orient.toLowerCase() == 'femval') {
            return 'femoralValgus'
        } else if (orient.toLowerCase() == 'trunk') {
            return 'trunk'
        } else if (orient.toLowerCase() == 'hip') {
            return 'hip'
        } else if (orient.toLowerCase() == 'kmfp') {
            return 'kneeMedialToFootPosition'
        } else return 'Unknown'
    }
}