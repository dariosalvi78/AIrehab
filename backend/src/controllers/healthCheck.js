import db from '../db/dbDriver.js'

/**
 * Healthcheck for database
 * @param {Object} req - express request
 * @param {Object} res - express response
 * @returns {Object} 200 OK if responding
*/
export default async function (req, res) {
  try {
    const resp = await db.tryConnection()
    if (resp.recordset) {
      res.sendStatus(200)
    } else {
      res.send('something went wrong: ' + resp)
    }
  } catch (err) {
    res.send('error while connecting to DB ' + err)
  }
}
