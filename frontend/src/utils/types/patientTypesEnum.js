
export default {
    types: { patient: ['foot', 'knee', 'hip', 'back'], sides: ['left', 'right', 'both'] },

    typeToDesc(t) {
        switch (t) {
            case 'Foot':
                return 'foot'
            case 'Knee':
                return 'knee'
            case 'Hip':
                return 'hip'
            case 'Back':
                return 'back'
            case 'Left':
                return 'left'
            case 'Right':
                return 'right'
            case 'Both':
                return 'both'
            default:
                return t
        }
    },

    typeToAsc(t) {
        switch (t) {
            case 'foot':
                return 'Foot'
            case 'knee':
                return 'Knee'
            case 'hip':
                return 'Hip'
            case 'back':
                return 'Back'
            case 'left':
                return 'Left'
            case 'right':
                return 'Right'
            case 'both':
                return 'Both'
            default:
                return t
        }
    }
}