
import db from "../db.js"
import { signAccessToken } from "../utils/tokenAuth.js"

export default {

    /**
     * Get all patients for a specific physiotherapist
     */
    getPatients: async (req, res) => {
        if (req.user.role == 'patient') return res.sendStatus(403)
        try {
            const response = await db.query(`
                SELECT p.names, p.id as patientID FROM [user] u
                INNER JOIN [patient] p ON u.id = p.physiotherapist_id
                WHERE u.email = '${req.user.email}';
            `)
            res.send(response.recordset)
        } catch (err) {
            console.error('error getting users: ', err)
            res.sendStatus(500)
            return
        }
    },

    /**
     * Get one patient for a specific physiotherapist
     */
    getPatient: async (req, res) => {
        if (!req.params || req.user.role == 'patient') return res.sendStatus(403)
        let user = req.body, patientID = req.params.patientID

        try {
            const physiotherapist = await (await db.query(`SELECT id, email from [user] WHERE email = '${req.user.email}'`)).recordset[0]

            const response = await db.query(`
                SELECT p.* FROM [patient] p
                WHERE p.id = '${patientID}'
                AND p.physiotherapist_id = '${physiotherapist.id}';
            `)
            res.send(response.recordset[0])
        } catch (err) {
            console.error('error getting user: ', err)
            res.sendStatus(500)
            return
        }
    },

    // TODO: let user complete registration using email
    // allow physiotherapist to add user for now
    addNewPatient: async (req, res) => {
        if (!req.user || req.user.role == 'patient') return res.sendStatus(403)
        let user = req.body

        const response = await db.query(`SELECT COUNT(*) as c FROM [user] WHERE email = '${user.email}';`)
        if (response.recordset[0].c !== 0) {
            res.status(409).send(`${user.email} is already registered`)
            return
        }

        try {
            const physiotherapist = await (await db.query(`SELECT id, email from [user] WHERE email = '${req.user.email}'`)).recordset[0]

            const patient = await db.query(`
                    INSERT INTO [patient] 
                    (id, names, dateofbirth, physiotherapist_id, height, weight, injuries, createdTimestamp)
                    OUTPUT Inserted.id, Inserted.physiotherapist_id, Inserted.createdTimestamp
                    VALUES(NEWID(), '${user.fullName}', '${user.dateOfBirth}', '${physiotherapist.id}', '${user.height}', '${user.weight}', '${user.injuries}', CURRENT_TIMESTAMP);
                `)
            console.info(`assigned ${patient.recordset[0].id} to physiotherapist ${physiotherapist.email}`)

            return res.status(201).json({
                status: 'created', data: { patient: patient.recordset[0] }
            })
        }
        catch (err) {
            console.error('something went wrong when adding user: ', err)
            res.sendStatus(500)
            return
        }
    }
}