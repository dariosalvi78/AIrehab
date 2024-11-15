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
     * Uploads the video file to the AI POE server
     * @param {Types.Exercise["id"]} exerciseID - exercise ID as we have it on the application server
     * @param {Types.Exercise["physiotherapySessionId"]} sessionID
     * @param {Types.Exercise["videoFile"]} videoFilename - video file local on the server
     * @param {Types.Exercise["type"]} exerciseType -  "singleLeggedSquatLeft" or "singleLeggedSquatRight", mapped to "L" or "R"
     * @returns {Promise<Boolean>}
     */
    async uploadVideo (exerciseID, sessionID, videoFilename, exerciseType) {
        if (config.poe.runModel === 'true') {
            const SESSION_DIR = 'session_' + sessionID + '/exercise_' + exerciseID
            const VIDEO_PATH = SESSION_DIR + '/vid_' + videoFilename
            try {
                let leg = exerciseType == 'singleLeggedSquatLeft' ? 'L' : 'R'
                let response = await axios.post(`${POE_SERVER_URL}/analyse_video?path=${VIDEO_PATH}&leg=${leg}`, 
                    { headers: { "Content-Type": 'application/json' } 
                })
                logger.info({ exerciseID: exerciseID }, 'UPLOADED VIDEO ON POEMA')
                if (response) return response
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
     * @param {Types.Exercise["videoFile"]} videoFilename
     * @returns {Promise<Response>}
     */
    async isEvaluationOngoing(sessionID, exerciseID, videoFilename) {
        if (config.poe.runModel === 'true') {
            try {
                const PATH_TO_VIDEO = 'session_' + sessionID + '/exercise_' + exerciseID + '/vid_' + videoFilename
                let response = await axios.get(`${POE_SERVER_URL}/ongoing?path=${PATH_TO_VIDEO}`)
                return response
            } catch (err) {
                if (err.status === 401) return { status: 200 }
                logger.error({ error: err }, 'cannot get ongoing POEMA status')
                return err
            }
        } else {
            if (!this.videoSentTimestamp) return { status: 201 }
            if (new Date().getTime() - this.videoSentTimestamp.getTime() > 10000) {
                this.videoSentTimestamp = null
                return { status: 201 }
            }
            else return { status: 200 }
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