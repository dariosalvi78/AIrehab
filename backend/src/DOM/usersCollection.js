import db from '../db.js'
import * as Types from '../../../datamodel/modeljdocs.mjs'


/**
 * Gets all users, except admin
 * @returns {Promise<Array.<Types.User>>}
 */
async function getUsers() {
    let response = await db.query(`
        SELECT id, email, role, createdTimestamp, lastLoginTimestamp 
        FROM [user] WHERE role != 'admin';
    `)
    return response.recordset
}

/**
 * Gets all the users with a given role.
 * @returns {Promise<Array.<Types.User>>}
 */
async function getUsersByRole(role) {
    let response = await db.query(`SELECT * FROM [user] u WHERE u.role = '${role}';`)
    return response.recordset
}

/**
 * Get one user with a given role
 * @returns {Promise<Types.User>}
 */
async function getOneUser(userID) {
    let response = await db.query(`SELECT TOP 1 * FROM [user] u WHERE u.id = '${userID}';`)
    return response.recordset[0]
}

/**
 * Inserts one user with user object
 * @param {Types.User["email"]} email
 * @param {Types.User["hashedPassword"]} password
 * @param {Types.User["role"]} role
 * @returns {Promise<Types.User>} added user
 */
async function createUser(email, password, role) {
    let response = await db.query(`
        INSERT INTO [user]
        (id, email, hashedpassword, role, createdTimestamp)
        OUTPUT Inserted.id, Inserted.email, Inserted.role, Inserted.createdTimestamp
        VALUES(NEWID(), '${email}', '${password}', '${role}', CURRENT_TIMESTAMP)
    `)
    return response.recordset[0]
}

/**
 * Update last login timestamp for one user given userID
 * @param {Types.User["id"]} userID 
 * @returns {Promise<void>}
 */
async function updateUserLoginTimestamp(userID) {
    await db.query(`
        UPDATE [user]
        SET [user].lastLoginTimestamp = CURRENT_TIMESTAMP
        WHERE [user].id = '${userID}';
    `)
}

/**@typedef {Types.User["email"]} email*/

/**
 * Get one user with given email
 * @param {Types.User["email"]} email 
 * @returns {Promise<Types.User>}
 */
async function getUserByEmail(email) {
    const response = await db.query(`
        SELECT TOP 1 
        id, email, hashedPassword, role, createdTimestamp, lastLoginTimestamp FROM [user]
        WHERE email = '${email}';
    `)
    return response.recordset[0]
}

export default {
    getUsers,
    getUsersByRole,
    getOneUser,
    createUser,
    updateUserLoginTimestamp,
    getUserByEmail
}