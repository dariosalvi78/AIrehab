
export default {
    title: 'Frågeformulär {surveyName}.',
    description: 'Som en del av denna studie så kommer du att få svara på {numOfQuestions} öppna frågor angående användning av POE-appen.',
    complete_form_description: 'När du har svarat på alla frågor i enkäten, vänligen tryck på knappen nedan för att skicka in dina svar.',
    notification_form_error: 'Vänligen fyll i hela formuläret',
    additional_info: { 
        title: 'Information om POE-bedömning',
        content: `
            <b>Postural orientering</b> handlar om kroppens förmåga att hålla olika delar - som höft, knä och bål - i rätt läge i förhållande till varandra när man rör sig. Det är ett sätt att bedöma rörelsekvalitet. 
            <br><br>
            <b>Postural orientation errors (POEs)</b> betyder att vissa delar av kroppen rör sig på ett mindre fördelaktigt sätt - till exempel att knät faller inåt eller att låret roterar inåt under en rörelse.
            <br><br>
            I den här studien används en mobilapp, kallad <b>POE-appen</b>, som med hjälp av AI automatiskt bedömer dessa rörelsemönster. Appen gör det enklare att identifiera avvikelser i rörelsekvalitet utan att behöva avancerad utrustning. 
        `
    },
    test_leader: {
        t1: [
            'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att hantera min patients/idrottares fysiska hälsa',
            'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min patients/idrottares prestation.',
            'Jag tror att det kommer vara enkelt att spela in en video med POE appen.',
            'Jag tror att det kommer vara enkelt att genomföra en bedömning med POE appen.',
            'Jag är positiv till att spela in postural orientering hos min patient/idrottare med POE appen.',
            'Jag är positiv till att dela med mig av min patients/idrottares data om postural orientering för forskningsändamål.',
            'Jag vill ha tillgång till och kunna granska min patients/idrottares data.',
            'Jag vill att min patient/idrottare ska ha tillgång till och kunna granska sin data.',
            'Jag vill att mina kollegor ska ha tillgång till och kunna granska data.',
            'Jag har för avsikt att använda POE appen under hela studiens gång.'
        ]
    },
    choices: [
        'Instämmer inte alls',
        'Instämmer i liten grad',
        'Varken instämmer eller inte',
        'Instämmer i hög grad',
        'Instämmer helt'
    ]
}
