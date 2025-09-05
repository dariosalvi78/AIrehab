
export default {
    types: {
        poe: [
            { name: 'femoralValgus', asc: 'Femoral valgus' },
            { name: 'trunk', asc: 'Trunk' },
            { name: 'hip', asc: 'Pelvis' },
            { name: 'kneeMedialToFootPosition', asc: 'Knee medial to foot position' },
            { name: 'femurMedialToShank', asc: 'Femur medial to shank' }
        ]
    },

    scores: {
        GOOD: { point: 0, text: 'Good', theme: 'positive' },
        FAIR: { point: 1, text: 'Fair', theme: 'warning' },
        POOR: { point: 2, text: 'Poor', theme: 'negative' }
    },

    /**
     * Formats POE orientation for interface
     * @param {String} orientation
     * @returns Formatted POE text
     */
    formattedPosturalOrientation(orientation) {
        let types = this.types.poe
        for (const poe in types) {
            if (types[poe].name === orientation) return types[poe].asc
        }
    },

    /**
     * Formats POE score (1, 2, 3) to text
     * @param {Number} point 
     * @returns Formatted score to text
     */
    formattedScoreToText(point) {
        let scores = Object.values(this.scores)
        for (const score in scores) {
            if (scores[score].point == point) return scores[score].text
        }
    },

    getPOEScoreBracket (sumOfScores) {
        let total = sumOfScores, scoreBracket
        if (total >= 60) {
            scoreBracket = this.scores.POOR
        } else if (total > 30 && total < 60) {
            scoreBracket = this.scores.FAIR
        } else if (total <= 30) {
            scoreBracket = this.scores.GOOD
        }
        return scoreBracket
    }
}