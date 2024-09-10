import db from '../db.js'
import * as types from '../../../datamodel/modeljdocs.js'


/**
 * @typedef {import('../../../datamodel/modeljdocs.js').User} User
 */


/**
 * Gets all the users with a given role.
 * @param {String} role - role, can be 'adimn' or 'physiotheprapist'
 * @returns {Promise<Array<User>>}
 */
async function getUsersByRole (role) {
    let response = await db.query(`SELECT COUNT(*) as u FROM [user] WHERE role = ${role};`)
    return response.recordset.map(r.u)
}

export {
    getUsersByRole
}