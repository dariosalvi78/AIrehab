
import logger from "../utils/logger.js"
import mssql from 'mssql'

export default {
    /**
     * @returns {mssql.ConnectionPool}
     */
    init: async function (dbConnectionConfig) {
        try {
            // make sure that any items are correctly URL encoded in the connection string
            const dbConnection = await mssql.connect(dbConnectionConfig)
            return dbConnection
        } catch (err) {
            logger.error({ error: err }, 'db connection failed')
        }
    },

    /**
     * Send DB query
     * @returns {mssql.IResult<any>}
     */
    query: async function (text) {
        let res = await mssql.query(text)
        logger.info({
            query: text,
            rows: res.output
        }, 'query executed')
        return res
    },

    /**
     * Checks if db connection is OK
     * @returns {Promise<mssql.IResult<any>>}
    */
    tryConnection: async function () {
        try {
            const result = await this.query(`SELECT GetDate() as currDate`)
            if (result) {
                logger.info({ data: result.recordset[0].currDate }, 'db is running:')
                return result
            }
        } catch (err) {
            logger.info('db connection failed: ', err)
        }
    },

    close: async function () { }
}