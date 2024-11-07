
export default {
    types: { exercise: ['singleLeggedSquatLeft', 'singleLeggedSquatRight'], patient: ['foot', 'knee', 'hip', 'back'] },

    typeToDesc(t) {
        switch (t) {
            case 'Single-leg Squat (Left)':
                return 'singleLeggedSquatLeft'
            case 'Single-leg Squat (Right)':
                return 'singleLeggedSquatRight'
            case 'Foot':
                return 'foot'
            case 'Knee':
                return 'knee'
            case 'Hip':
                return 'hip'
            case 'Back':
                return 'back'
            default:
                return t
        }
    },

    typeToAsc(t) {
        switch (t) {
            case 'singleLeggedSquatLeft':
                return 'Single-leg Squat (Left)'
            case 'singleLeggedSquatRight':
                return 'Single-leg Squat (Right)'
            case 'foot':
                return 'Foot'
            case 'knee':
                return 'Knee'
            case 'hip':
                return 'Hip'
            case 'back':
                return 'Back'
            default:
                return t
        }
    }
}