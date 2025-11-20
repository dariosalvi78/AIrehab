import archiver from 'archiver'
import logger from './logger.js'
import surveysCollection from '../DOM/surveysCollection.js'
import { json2csv as csv } from 'json-2-csv';

export default {
    /**
     * Stream zip file containing survey data directly to response
     * @param {import('express').Response} res express response
     * @returns {Promise<Object>} file streaming done
     */
    streamArchivedSurveyData: async (res) => {
        /** @type {archiver.Archiver} */
        let archive = undefined
        return new Promise(async (resolve, reject) => {
            try {
                const outputFilename = new Date().toISOString().split('T')[0] + '_enkäter.zip'

                res.setHeaders(new Headers({
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename=${outputFilename}`
                })).status(201)
        
                res.on('finish', () => {
                    if (archive.destroyed && archive.pointer() <= 0) return resolve()
                    logger.info({ file: outputFilename, bytes: archive.pointer() }, 'downloaded surveys:')
                    return resolve(res)
                }).on('error', (err) => {
                    return reject(new Error('response stream error: ' + err.message))
                })

                archive = archiver('zip', {
                    zlib: { level: 9 } // compression level
                })

                // pipe archive output directly to response
                archive.pipe(res)

                archive.on('warning', function (err) {
                    logger.debug({ error: err }, 'warning occurred during survey data streaming')
                })

                archive.on('error', function (err) {
                    archive.destroy()
                    if (!res.headersSent) res.status(500).end()
                    return reject(err)
                })

                const surveys = await surveysCollection.getSurveys()
                if (surveys && !surveys.length) {
                    reject({ error: { 
                        message: 'no surveys available for download', 
                        timestamp: new Date().toISOString() }, statusCode: 404 
                    })
                    archive.destroy()
                    return
                }

                let surveysFormatted = { användare: [], patient: [] }
                surveys.forEach((survey, i) => {
                    const userType = !survey.patientId ? 'användare' : 'patient'
                    surveysFormatted[userType].push({
                        ID: 'Enkät_' + (i + 1),
                        surveyName: survey.surveyName,
                        ...JSON.parse(survey.content)
                    })
                })

                for (const i in Object.keys(surveysFormatted)) {
                    const userType = Object.keys(surveysFormatted)[i],
                        surveyToCSV = csv(surveysFormatted[userType], { unwindArrays: true, emptyFieldValue: '' })

                    archive.append(surveyToCSV, { name: `${userType}/` + 'enkäter.csv' })
                    archive.append(JSON.stringify(surveysFormatted[userType] || [], null, 4), { name: `${userType}/` + 'enkäter.json' })
                }
                await archive.finalize()

            } catch (err) {
                archive.destroy()
                return reject(err)
            }
        })
    }
}