import * as Types from '../datamodel/modeljdocs.mjs'
import db from '../db/dbDriver.js'

export default {
    /**
     * Gets all surveys
     * @returns {Promise<Array.<Types.SurveyAnswer>>}
     */
    getSurveys: async function () {
        let response = await db.query(`
            SELECT s.* FROM survey_answer s
            ORDER BY s.createdTimestamp DESC;
        `)
        return response.recordset
    }
}
