
export default {
    title: 'Questionnaire {surveyName}.',
    description: 'As part of this study, you will be asked to answer {numOfQuestions} open-ended questions regarding your use of the POE app.',
    complete_form_description: 'Once you have answered all the questions in the survey, please press the button below to submit your answers.',
    notifications: {
        form_error: 'Please fill out the entire form',
        upload_completed: 'Questionnaire sent. Thank you for your participation'
    },
    additional_info: { 
        title: 'Information about POE assessment',
        content: `
            <b>Postural orientering</b> handlar om kroppens förmåga att hålla olika delar - som höft, knä och bål - i rätt läge i förhållande till varandra när man rör sig. Det är ett sätt att bedöma rörelsekvalitet. 
            <br><br>
            <b>Postural orientation errors (POEs)</b> betyder att vissa delar av kroppen rör sig på ett mindre fördelaktigt sätt - till exempel att knät faller inåt eller att låret roterar inåt under en rörelse.
            <br><br>
            I den här studien används en mobilapp, kallad <b>POE-appen</b>, som med hjälp av AI automatiskt bedömer dessa rörelsemönster. Appen gör det enklare att identifiera avvikelser i rörelsekvalitet utan att behöva avancerad utrustning. 
        `
    },
    choices: {
        scales: [
            'Disagree completely',
            'Disagree somewhat',
            'Neither agree nor disagree',
            'Strongly agree',
            'Completely agree'
        ],
        text: {
            label: 'Write your answer',
            hint: 'Optional. Free-text question'
        }
    }
}