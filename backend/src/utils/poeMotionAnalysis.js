import * as Types from '../../../datamodel/modeljdocs.mjs'


export default {

    // simulation only:
    videoSentTimestamp: undefined,

    /**
     * Creates a user on the AI POE server
     * @param {string} userId - patient ID as we have it on the application server
     * @param {number} length - length of subject in cm
     * @param {number} weight - weight in kg
     */
    async createUser (userId, length, weight) {
        console.log('CREATED USER ON POEMA', userId)
        return true;
    },

    /**
     * Deletes use on the AI POE server
     * @param {string} userId - patient ID as we have it on the application server
     */
    async deleteUser (userId) {
        console.log('DELETED USER ON POEMA', userId)
        return true;
    },

    /**
     * Uploads the video file to the AI POE server
     * @param {string} userId - patient ID as we have it on the application server
     * @param {string} videoPath - path of the file local on the server
     * @param {string} exerciseType -  "singleLeggedSquatLeft" or "singleLeggedSquatRight", mapped to "L" or "R"
     * @returns {Promise}
     */
    async uploadVideo (userId, videoPath, exerciseType) {
        console.log('UPLADED VIDEO ON POEMA', userId)
        videoSentTimestamp = new Date()
        return true;
    },

    /**
     * Tells if a video is being analyzed
     * @param {string} userId - patient ID as we have it on the application server
     * @returns {Promise<boolean>}
     */
    async isEvaluationOngoing (userId) {
        if (!videoSentTimestamp) return false
        if (Date.now().getTime() - videoSentTimestamp.getTime() < 30000) return false
        else return true
    },

    /**
     * Retrieves the POE analysis for the latest uploaded video
     * @param {string} userId - patient ID as we have it on the application server
     * @returns {Promise<Array<POEEvaluation>}
     */
    async getLatestPOEAnalysis (userId) {

        // simulation of a returned object from the POE API
        let POEObj = {
            "combined": {
                "time": "string",
                "pred": {
                    "femval": 0,
                    "trunk": 0,
                    "hip": 0,
                    "kmfp": 0
                },
                "conf": {
                    "femval": [
                        0,
                        0,
                        0
                    ],
                    "trunk": [
                        0,
                        0,
                        0
                    ],
                    "hip": [
                        0,
                        0,
                        0
                    ],
                    "kmfp": [
                        0,
                        0,
                        0
                    ]
                }
            },
            "reps": {
                "femval": {
                    "pred": [
                        0
                    ],
                    "conf": [
                        0
                    ]
                },
                "trunk": {
                    "pred": [
                        0
                    ],
                    "conf": [
                        0
                    ]
                },
                "hip": {
                    "pred": [
                        0
                    ],
                    "conf": [
                        0
                    ]
                },
                "kmfp": {
                    "pred": [
                        0
                    ],
                    "conf": [
                        0
                    ]
                }
            }
        }

        /**
         * Array of POEEvaluation
         */
        let returnedValue = []

        // adapt theobject returned from the API into the POEEvaluation
        for (let postOr in POEObj.combined.pred) {
            returnedValue.push(
                {
                    posturalOrientation: mapPosturalOrientation(postOr), //'trunk', 'hip', 'femoralValgus', 'kneeMedialToFootPosition'
                    repetition: 0, // summative or "comined"
                    score: POEObj.combined.pred[postOr], // can be 0=good (bra), 1=fair (nedsatt), 2=poor (dåligt),
                    confidence0: POEObj.combined.conf[postOr][0],
                    confidence1: POEObj.combined.conf[postOr][1],
                    confidence2: POEObj.combined.conf[postOr][2],
                }
            )
        }

        for (let postOr in POEObj.reps) {
            for (let repetition = 0; repetition < POEObj.reps[postOr].pred.length; repetition++)
                returnedValue.push(
                    {
                        posturalOrientation: this.mapPosturalOrientation(postOr), //'trunk', 'hip', 'femoralValgus', 'kneeMedialToFootPosition'
                        repetition: repetition,
                        score: POEObj.reps[postOr].pred[repetition], // can be 0=good (bra), 1=fair (nedsatt), 2=poor (dåligt),
                        confidence0: POEObj.reps[postOr].conf[repetition]
                        // confidence1: POEObj.combined.conf[postOr][1], ???
                        // confidence2: POEObj.combined.conf[postOr][2], ???
                    }
                )
        }

        return returnedValue;
    },

    mapPosturalOrientation (orient) {
        if (orient.toUpperCase() == 'femval') {
            return 'femoralValgus'
        } else if (orient.toUpperCase() == 'trunk') {
            return 'trunk'
        } else if (orient.toUpperCase() == 'hip') {
            return 'hip'
        } else if (orient.toUpperCase() == 'kmfp') {
            return 'kneeMedialToFootPosition'
        } else return 'unkown'
    }
}