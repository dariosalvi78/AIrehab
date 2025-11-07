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
    },

    /**
     * Gets all surveys for specific user
     * @param {Types.SurveyAnswer["physiotherapistId"]} physiotherapistId
     * @returns {Promise<Array.<Types.SurveyAnswer>>}
     */
    getSurveysByPhysioID: async function (physiotherapistID) {
        let response = await db.query(`
            SELECT s.id, s.surveyName, s.createdTimestamp FROM survey_answer s
                WHERE s.physiotherapistId = '${physiotherapistID}'
            GROUP BY s.id, s.surveyName, s.createdTimestamp
            ORDER BY s.createdTimestamp DESC;
        `)
        return response.recordset
    },

    /**
     * Creates one survey using survey data
     * @param {Types.SurveyAnswer["physiotherapistId"]} physiotherapistId
     * @param {Types.SurveyAnswer["patientId"]} patientId
     * @param {Types.SurveyAnswer["content"]} content
     * @param {Types.SurveyAnswer["surveyName"]} name
     * @returns {Promise<Types.SurveyAnswer>} added survey
     */
    createSurvey: async function (physiotherapistId, patientId, name, content) {
        let response = await db.query(`
            INSERT INTO survey_answer
            (id, physiotherapistId, patientId, surveyName, content, createdTimestamp)
            OUTPUT Inserted.id, Inserted.content, Inserted.createdTimestamp
            VALUES(NEWID(), '${physiotherapistId}', ${patientId ? `${patientId}` : null}, '${name}', N'${content}', CURRENT_TIMESTAMP)
        `)
        return response.recordset[0]
    },

}
