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
            OUTPUT Inserted.id, Inserted.surveyName, Inserted.content, Inserted.createdTimestamp
            VALUES(NEWID(), '${physiotherapistId}', ${patientId ? `'${patientId}'` : null}, '${name}', N'${content}', CURRENT_TIMESTAMP)
        `)
        return response.recordset[0]
    },


    /**
     * Check if survey reminder for test leaders should be sent out.
     * - Send 2 reminders from survey date that are 3 days apart
     * @param {Types.SurveyAnswer["physiotherapistId"]} physiotherapistId
     * @param {Types.SurveyAnswer["createdTimestamp"]} availableOnTimestamp date when survey became available for user
     * @returns {Promise<Types.SurveyAnswer>} survey reminder to send
     */
    isReminderTimestamp: async function (physiotherapistId, availableOnTimestamp) {
        let response = await db.query(`
            SELECT s.id, s.createdTimestamp,
                CASE
                    WHEN COALESCE(count(s.id), 0) >= 1
                        AND DATEDIFF(day, '${new Date(availableOnTimestamp).toISOString()}', CURRENT_TIMESTAMP) IN (3, 6)
                    THEN CAST(1 AS BIT)
                    ELSE CAST(0 AS BIT)
                END AS sendReminder
            FROM survey_answer s
                WHERE s.physiotherapistId = '${physiotherapistId}' AND s.patientId IS NULL
            GROUP BY s.id, s.createdTimestamp
            ORDER BY s.createdTimestamp DESC;
        `)
        return response.recordset[0]
    },

    /**
     * Check if a new survey is available for test leader
     * - Conditions: 1st survey: now, 2nd survey: 14 days from first survey, 3rd: 60 days from second survey
     * @param {Types.User["id"]} physioID
     * @returns {Promise<Types.SurveyAnswer>} survey reminder to send
     */
    isPhysioSurveyAvailable: async function (physioID) {
        let response = await db.query(`
            WITH latest_survey AS (
                SELECT s.latestDate, s.completed,
                    CASE
                        WHEN s.completed <= 0 THEN CURRENT_TIMESTAMP
                        WHEN s.completed = 1 THEN DATEADD(day, 14, s.latestDate)
                        WHEN s.completed = 2 THEN DATEADD(day, 60, s.latestDate)
                        ELSE NULL
                    END AS availableOnTimestamp
                FROM (
                    SELECT MAX(s.createdTimestamp) AS latestDate, count(*) AS completed
                    FROM survey_answer s WHERE s.physiotherapistId = '${physioID}' AND s.patientId IS NULL
                ) s
            )
            SELECT l.completed, l.availableOnTimestamp,
                CASE 
                    WHEN l.availableOnTimestamp IS NULL THEN CAST(0 AS BIT)
                    WHEN CURRENT_TIMESTAMP >= l.availableOnTimestamp THEN CAST(1 AS BIT)
                    ELSE CAST(0 AS BIT)
                END AS isAvailable
            FROM latest_survey l;
        `)
        return response.recordset[0]
    },

    /**
     * Check if a new survey is available for patient
     * - Conditions: 1st survey: now, 2nd survey: completed at least 3 exercises, 3rd: 6 weeks (42 days) and 5 exercises
     * @param {Types.Patient["id"]} patientID
     * @returns {Promise<Types.SurveyAnswer>} survey reminder to send
     */
    isPatientSurveyAvailable: async function (patientID) {
        let response = await db.query(`
            WITH s_exercises AS (
                SELECT 
                    COUNT(DISTINCT e.id) AS exerciseTotal
                FROM [physiotherapy_session] session
                JOIN [exercise] e ON session.id = e.physiotherapySessionId
                WHERE session.patientId = '${patientID}'
            ),
            latest_survey AS (
                SELECT s.latestDate, s.completed, s.exerciseTotal,
                    CASE
                        WHEN s.completed <= 0 THEN CURRENT_TIMESTAMP
                        WHEN s.completed = 1 AND s.exerciseTotal >= 3 THEN CURRENT_TIMESTAMP
                        WHEN s.completed = 2 AND s.exerciseTotal >= 5 THEN DATEADD(day, 42, s.latestDate)
                        ELSE NULL
                    END AS availableOnTimestamp
                FROM (
                    SELECT MAX(s.createdTimestamp) AS latestDate, count(*) AS completed, e.exerciseTotal
                    FROM survey_answer s
                    CROSS JOIN s_exercises e
                    WHERE s.patientId = '${patientID}' AND s.patientId IS NOT NULL AND s.physiotherapistId IS NOT NULL
                    GROUP BY e.exerciseTotal
                ) s
            )
            SELECT l.completed, l.availableOnTimestamp, l.exerciseTotal,
                CASE 
                    WHEN l.availableOnTimestamp IS NULL THEN CAST(0 AS BIT)
                    WHEN CURRENT_TIMESTAMP >= l.availableOnTimestamp THEN CAST(1 AS BIT)
                    ELSE CAST(0 AS BIT)
                END AS isAvailable
            FROM latest_survey l;
        `)
        return response.recordset[0]
    }
}
