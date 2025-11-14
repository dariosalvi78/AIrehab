
export default {
    title: 'Questionnaire {surveyName}',
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
    test_leader: {
        T1: [
            { code: 'PU1', q: 'I believe that measuring postural orientation with the POE app will likely help manage my patients/athletes physical health.' },
            { code: 'PU2', q: 'I believe that measuring postural orientation with the POE app will likely help improve my patients/athletes performance.' },
            { code: 'PEOU1', q: 'I think it will be easy to record a video with the POE app.' },
            { code: 'PEOU2', q: 'I think it will be easy to carry out an assessment with the POE app.' },
            { code: 'A1', q: 'I am positive about recording postural orientation for my patient/athlete with the POE app.' },
            { code: 'A2', q: 'I am willing to share my patients/athletes data on postural orientation for research purposes.' },
            { code: 'A3', q: 'I want to have access to and be able to review my patients/athletes data.' },
            { code: 'A4', q: 'I want my patient/athlete to have access to and be able to review their data.' },
            { code: 'A5', q: 'I want my colleagues to have access to and be able to review the data.' },
            { code: 'BI1', q: 'I intend to use the POE app throughout the study.' }
        ],
        T2: [
            { code: 'PU1', q: 'I believe that measuring postural orientation with the POE app will likely help manage my patients/athletes physical health.' },
            { code: 'PU2', q: 'I believe that measuring postural orientation with the POE app will likely help improve my patients/athletes performance.' },
            { code: 'PEOU1', q: "I find it easy to record a video with the POE app." },
            { code: 'PEOU2', q: 'I find it easy to conduct an assessment with the POE app.' },
            { code: 'A1', q: 'I am positive about recording postural orientation for my patient/athlete with the POE app.' },
            { code: 'A2', q: 'I am willing to share my patients/athletes data on postural orientation for research purposes.' },
            { code: 'A3', q: 'I want to have access to and be able to review my patients/athletes data.' },
            { code: 'A4', q: 'I want my patient/athlete to have access to and be able to review their data.' },
            { code: 'A5', q: 'I want my colleagues to have access to and be able to review the data.' },
            { code: 'BI1', q: 'I intend to use the POE app throughout the study.' },
            { code: 'UB1', q: 'How would you describe your use of the POE app?' },
            { code: 'UB2', q: 'What difficulties (if any) did you experience when using the POE app?' }
        ],
        T3: [
            { code: 'PU1', q: 'I believe that measuring postural orientation with the POE app will likely help manage my patients/athletes physical health.' },
            { code: 'PU2', q: 'I believe that measuring postural orientation with the POE app will likely help improve my patients/athletes performance.' },
            { code: 'PEOU1', q: "I find it easy to record a video with the POE app." },
            { code: 'PEOU2', q: 'I find it easy to conduct an assessment with the POE app.' },
            { code: 'A1', q: 'I am positive about recording postural orientation for my patient/athlete with the POE app.' },
            { code: 'A2', q: 'I am willing to share my patients/athletes data on postural orientation for research purposes.' },
            { code: 'A3', q: 'I want to have access to and be able to review my patients/athletes data.' },
            { code: 'A4', q: 'I want my patient/athlete to have access to and be able to review their data.' },
            { code: 'A5', q: 'I want my colleagues to have access to and be able to review the data.' },
            { code: 'BI1', q: 'I intend to use the POE app throughout the study.' },
            { code: 'UB1', q: 'How would you describe your use of the POE app?' },
            { code: 'UB2', q: 'What difficulties (if any) did you experience when using the POE app?' }
        ]
    },
    patient: {
        T1: [
            { code: 'PU1', q: 'I believe that measuring postural orientation with the POE app will likely help me manage my physical health.' },
            { code: 'PU2', q: 'I believe that measuring postural orientation with the POE app will likely help improve my performance.' },
            { code: 'PEOU1', q: 'I think it will be easy to see and interpret the results in the POE app.' },
            { code: 'A1', q: 'I am positive about recording my postural orientation with the POE app.' },
            { code: 'A2', q: 'I am positive about sharing my postural orientation data for research purposes.' },
            { code: 'A3', q: 'I want to have access to and be able to review my data.' },
            { code: 'A4', q: 'I want my physical therapist/trainer to have access to and be able to review my data.' },
            { code: 'BI1', q: 'I intend to use the POE app throughout the study.' },
        ],
        T2: [
            { code: 'PU1', q: 'I believe that measuring postural orientation with the POE app will likely help me manage my physical health.' },
            { code: 'PU2', q: 'I believe that measuring postural orientation with the POE app will likely help improve my performance.' },
            { code: 'PEOU1', q: 'I find it easy to view and interpret the results in the POE app.' },
            { code: 'A1', q: 'I am positive about recording my postural orientation with the POE app.' },
            { code: 'A2', q: 'I am positive about sharing my postural orientation data for research purposes.' },
            { code: 'A3', q: 'I want to have access to and be able to review my data.' },
            { code: 'A4', q: 'I want my physical therapist/trainer to have access to and be able to review my data.' },
            { code: 'BI1', q: 'I intend to use the POE app throughout the study.' },
            { code: 'UB1', q: 'How would you describe your use of the POE app?' },
            { code: 'UB2', q: 'What difficulties (if any) did you experience when using the POE app?' }
        ],
        T3: [
            { code: 'PU1', q: 'I believe that measuring postural orientation with the POE app will likely help me manage my physical health.' },
            { code: 'PU2', q: 'I believe that measuring postural orientation with the POE app will likely help improve my performance.' },
            { code: 'PEOU1', q: 'I find it easy to view and interpret the results in the POE app.' },
            { code: 'A1', q: 'I am positive about recording my postural orientation with the POE app.' },
            { code: 'A2', q: 'I am positive about sharing my postural orientation data for research purposes.' },
            { code: 'A3', q: 'I want to have access to and be able to review my data.' },
            { code: 'A4', q: 'I want my physical therapist/trainer to have access to and be able to review my data.' },
            { code: 'BI1', q: 'I intend to use the POE app throughout the study.' },
            { code: 'UB1', q: 'How would you describe your use of the POE app?' },
            { code: 'UB2', q: 'What difficulties (if any) did you experience when using the POE app?' }
        ]
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