
import pino, { destination } from 'pino'

const logger = pino({
    transport: {
        target: 'pino/file',
        options: {
            destination: './logs/app.log'
        }
    }
})

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