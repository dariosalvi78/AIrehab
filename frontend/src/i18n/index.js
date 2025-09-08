
const messages = {
    en: {
        exercises: (await import('./exercises/en.js')).default
    },
    sv: {
        exercises: (await import('./exercises/sv.js')).default
    }
}

export default messages