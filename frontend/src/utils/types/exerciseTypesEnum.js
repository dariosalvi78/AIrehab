
export default {
    types: { exercise: ['singleLeggedSquatLeft', 'singleLeggedSquatRight'] },

    typeToDesc(t) {
        switch (t) {
            case 'Single-leg Squat (Left)':
                return 'singleLeggedSquatLeft'
            case 'Single-leg Squat (Right)':
                return 'singleLeggedSquatRight'
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
            default:
                return t
        }
    }
}