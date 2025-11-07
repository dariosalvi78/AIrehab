// DB schema
// https://app.chartdb.io/diagrams/lxvpwqcifsbjimmnrcfgmnj4r


/**
 * @typedef {Object} User
 * @property {!string} id - unique identifier
 * @property {!string} createdTimestamp - ISO 8601 date and time of when the user was created
 * @property {!string} lastLoginTimestamp - ISO 8601 date and time of last login
 * @property {!string} email - email address of the user
 * @property {string} hashedPassword - password, hashed
 * @property {!string} role - 'admin' or 'physiotherapist'
 * @property {!boolean} activated - if user (the physiotherapist) has given consent and agreed to the research study
 */

/**
 * @typedef {Object} Patient
 * @property {!string} id - unique identifier
 * @property {!string} createdTimestamp - ISO 8601 date and time of when the patient was created
 * @property {!string} physiotherapistId - unique identifier of the phyisiotherapist in charge
 * @property {!string} names - first and second (ort third, fourth etc.) names
 * @property {!string} dateOfBirth - date of birth, format "yyyy-MM-DD"
 * @property {number} height - height in cm
 * @property {number} weight - weight in KGs
 * @property {?string} injuries - general description of injuries
 * @property {?string} injuredSide - side of the body that is injured, 'left', 'right' or 'both'
 * @property {?string} injuredBodyPart - body part that is injured. 'foot', 'knee', 'hip', 'back'
 * @property {!boolean} activated - if patient has given consent and agreed to the research study
 * @property {?string} email - email address of the patient, to send out personal access link and reminders
 */

/**
 * @typedef {Object} POEEvaluation
 * @property {!string} id - unique identifier
 * @property {number} repetition - repetition number, null or 0 means that this is a summative evaluation
 * @property {!number} score - can be 0=good (bra), 1=fair (nedsatt), 2=poor (dåligt)
 * @property {!string} posturalOrientation - 'trunk', 'hip', 'femoralValgus', 'kneeMedialToFootPosition', 'femurMedialToShank'
 * @property {number} confidence0 - confidence value for score 0
 * @property {number} confidence1 - confidence value for score 1
 * @property {number} confidence2 - confidence value for score 2
 */

/**
 * @typedef {Object} PhysiotherapySession 
 * @property {!string} id - unique identifier
 * @property {!string} patientId - id of the patient
 * @property {string} startTimestamp - ISO 8601 date and time
 * @property {string} endTimestamp - ISO 8601 date and time
 */


/**
 * @typedef {Object} Exercise
 * @property {!string} id - unique identifier
 * @property {!string} physiotherapySessionId - id of the physiotherapy session
 * @property {string} startTimestamp - ISO 8601 date and time
 * @property {string} endTimestamp - ISO 8601 date and time
 * @property {!string} type - type of exercise, can be "singleLeggedSquatLeft" or "singleLeggedSquatRight"
 * @property {string} videoFile - filename of the video associated to the exercise
 * @property {?POEEvaluation} POEEvaluation - object containing metrics about the quality of the exercise
 * @property {?string} notes - some textual notes
 */

/**
 * @typedef {Object} SurveyAnswer 
 * @property {!string} id - unique identifier
 * @property {!string} physiotherapistId - id of the physiotherapist
 * @property {?string} patientId - id of the patient
 * @property {!string} surveyName - name of the survey
 * @property {!string} content - survey content, questions and answers
 * @property {string} createdTimestamp - ISO 8601 date and time
 */

export const Types = {}