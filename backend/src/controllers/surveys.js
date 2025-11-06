
import * as Types from '../datamodel/modeljdocs.mjs'
import surveys from "../DOM/surveysCollection.js"
import patient from "../DOM/physiotherapistCollection.js"
import logger from "../utils/logger.js"

export default {
    /**
     * Get all surveys
     * @param {Object} req - express request
     * @param {Object} res - express response
     * @returns {Promise<Array<Types.SurveyAnswer>>}
     */
    getSurveys: async (req, res) => {
        if (!req.user) return res.sendStatus(403)
        try {
            const results = await surveys.getSurveys()
            res.send(results)
        } catch (err) {
            logger.error({ error: err }, 'error getting surveys')
            res.sendStatus(500)
            return
        }
    }
}