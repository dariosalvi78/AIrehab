import commonEN from './common/en.js'
import commonSV from './common/sv.js'
import patientEN from './patient/en.js'
import patientSV from './patient/sv.js'
import exercisesEN from './exercises/en.js'
import exercisesSV from './exercises/sv.js'
import poeEN from './poe/en.js'
import poeSV from './poe/sv.js'
import surveyEN from './survey/en.js'
import surveySV from './survey/sv.js'
import adminEN from './admin/en.js'
import adminSV from './admin/sv.js'

const messages = {
    en: {
        admin: adminEN,
        common: commonEN,
        patient: patientEN,
        exercises: exercisesEN,
        poe: poeEN,
        survey: surveyEN
    },
    sv: {
        admin: adminSV,
        common: commonSV,
        patient: patientSV,
        exercises: exercisesSV,
        poe: poeSV,
        survey: surveySV
    }
}

export default messages