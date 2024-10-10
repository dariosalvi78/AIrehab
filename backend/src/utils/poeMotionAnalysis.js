import * as Types from '../../../datamodel/modeljdocs.mjs'


export default {

    // simulation only:
    videoSentTimestamp: undefined,

    /**
     * Creates a user on the AI POE server
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     * @param {Types.Patient["height"]} length - length of subject in cm
     * @param {Types.Patient["weight"]} weight - weight in kg
     */
    async createUser (userId, length, weight) {
        console.log('CREATED USER ON POEMA', userId)
        return true;
    },

    /**
     * Deletes user on the AI POE server
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     */
    async deleteUser (userId) {
        console.log('DELETED USER ON POEMA', userId)
        return true;
    },

    /**
     * Uploads the video file to the AI POE server
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     * @param {Types.Exercise["videoFile"]} videoPath - path of the file local on the server
     * @param {Types.Exercise["type"]} exerciseType -  "singleLeggedSquatLeft" or "singleLeggedSquatRight", mapped to "L" or "R"
     * @returns {Promise<Boolean>}
     */
    async uploadVideo (userId, videoPath, exerciseType) {
        console.log('UPLADED VIDEO ON POEMA', userId)
        this.videoSentTimestamp = new Date()
        return true;
    },

    /**
     * Tells if a video is being analyzed
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     * @returns {Promise<Boolean>}
     */
    async isEvaluationOngoing (userId) {
        if (!this.videoSentTimestamp) return false
        if (new Date().getTime() - this.videoSentTimestamp.getTime() < 10000) return false
        else return true
    },  

    /**
     * Retrieves the POE analysis for the latest uploaded video
     * @param {Types.Patient["id"]} userId - patient ID as we have it on the application server
     * @returns {Promise<Array<Types.POEEvaluation>>}
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
                    "kmfp": 1
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
                        88.5,
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
                    posturalOrientation: this.mapPosturalOrientation(postOr), //'trunk', 'hip', 'femoralValgus', 'kneeMedialToFootPosition'
                    repetition: 0, // summative or "combined"
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