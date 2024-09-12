
import pino from 'pino'
import fs from 'node:fs'
import config from './config.js'

const basePath = config.log.path
let logger

(async () => {
    try {
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath)
        }

        logger = pino({
            transport: {
                target: 'pino/file',
                options: {
                    destination: basePath + 'app.log'
                }
            }
        })

        console.info('Starting logger')

    } catch (err) {
        console.error(err)
        return;
    }
})()

export default {
    info (data, msg) {
        if (msg) {
            logger.info(data, msg)
            console.info(msg, data)    
        }
    },
    error (data, msg) {
        if (msg) {
            logger.error(data, msg)
            console.error(msg, data)
        }
    },
    debug (data, msg) {
        if (msg) {
            logger.debug(data, msg)
            console.debug(msg, data)
        }
    }
}