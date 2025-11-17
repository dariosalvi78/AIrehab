import fs, { mkdir } from 'fs'
import archiver from 'archiver'
import logger from './logger.js'
import surveysCollection from '../DOM/surveysCollection.js'
import config from './config.js'

export default {
    
    /**
     * Create zip file of survey data
     * @returns {Promise<File>} survey data contained in zip file
     */
    getArchivedSurveyData: async () => {
        return new Promise(async (resolve, reject) => {
            const filename = Date.now() + '_enkäter' + '.zip', TEMP_PATH = config.uploads.base_path + '/tmp/'

            if (!fs.existsSync(TEMP_PATH)) {
                mkdir(TEMP_PATH, { recursive: true }, (err) => { return reject(err) })
            }

            const FULL_PATH = TEMP_PATH + filename
            const filestream = fs.createWriteStream(FULL_PATH)
                .on('data', () => resolve(filename))
                .on('finish', () => resolve(filename))
                .on('close', () => resolve(filename))
                .on('end', () => filestream.close())
                .on('error', (err) => {
                    filestream.close()
                    return reject(new Error('filestream error: ' + err.message))
                })
            const archive = archiver('zip', {
                zlib: { level: 9 } // compression level
            })

            archive.pipe(filestream)

            archive.on('warning', function (err) {
                logger.debug({ error: err }, 'warning occurred during survey data')
            })

            // catch error explicitly
            archive.on('error', function (err) {
                return reject(err)
            })

            const surveys = await surveysCollection.getSurveys()
            if (!surveys) return resolve()
            archive.append(JSON.stringify(surveys), { name: 'enkäter.json' })

            archive.finalize()
            return resolve(FULL_PATH)
        })
    }
}