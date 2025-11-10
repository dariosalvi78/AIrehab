
export default {
    title: 'Frågeformulär {surveyName}.',
    description: 'Som en del av denna studie så kommer du att få svara på {numOfQuestions} öppna frågor angående användning av POE-appen.',
    complete_form_description: 'När du har svarat på alla frågor i enkäten, vänligen tryck på knappen nedan för att skicka in dina svar.',
    notifications: {
        form_error: 'Vänligen fyll i hela formuläret',
        upload_completed: 'Frågeformulär har skickats. Tack för din medverkan'
    },
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
        T1: [
            { code: 'PU1', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att hantera min patients/idrottares fysiska hälsa' },
            { code: 'PU2', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min patients/idrottares prestation.' },
            { code: 'PEOU1', q: 'Jag tror att det kommer vara enkelt att spela in en video med POE appen.' },
            { code: 'PEOU2', q: 'Jag tror att det kommer vara enkelt att genomföra en bedömning med POE appen.' },
            { code: 'A1', q: 'Jag är positiv till att spela in postural orientering hos min patient/idrottare med POE appen.' },
            { code: 'A2', q: 'Jag är positiv till att dela med mig av min patients/idrottares data om postural orientering för forskningsändamål.' },
            { code: 'A3', q: 'Jag vill ha tillgång till och kunna granska min patients/idrottares data.' },
            { code: 'A4', q: 'Jag vill att min patient/idrottare ska ha tillgång till och kunna granska sin data.' },
            { code: 'A5', q: 'Jag vill att mina kollegor ska ha tillgång till och kunna granska data.' },
            { code: 'BI1', q: 'Jag har för avsikt att använda POE appen under hela studiens gång.' }
        ],
        T2: [
            { code: 'PU1', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att hantera min patients/idrottares fysiska hälsa' },
            { code: 'PU2', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min patients/idrottares prestation.' },
            { code: 'PEOU1', q: 'Jag tycker att det är enkelt att spela in en video med POE appen.' },
            { code: 'PEOU2', q: 'Jag tycker att det är enkelt att genomföra en bedömning med POE appen.' },
            { code: 'A1', q: 'Jag är positiv till att spela in postural orientering hos min patient/idrottare med POE appen' },
            { code: 'A2', q: 'Jag är positiv till att dela med mig av min patients/idrottares data om postural orientering för forskningsändamål.' },
            { code: 'A3', q: 'Jag vill ha tillgång till och kunna granska min patients/idrottares data.' },
            { code: 'A4', q: 'Jag vill att min patient/idrottare ska ha tillgång till och kunna granska sin data.' },
            { code: 'A5', q: 'Jag vill att mina kollegor ska ha tillgång till och kunna granska data.' },
            { code: 'BI1', q: 'Jag har för avsikt att använda POE appen under hela studiens gång.' },
            { code: 'UB1', q: 'Hur skulle du beskriva din användning av POE appen?' },
            { code: 'UB2', q: 'Vilka svårigheter (om några) upplevde du när du använde POE appen?' }
        ],
        T3: [
            { code: 'PU1', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att hantera min patients/idrottares fysiska hälsa' },
            { code: 'PU2', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min patients/idrottares prestation.' },
            { code: 'PEOU1', q: 'Jag tycker att det är enkelt att spela in en video med POE appen.' },
            { code: 'PEOU2', q: 'Jag tycker att det är enkelt att genomföra en bedömning med POE appen.' },
            { code: 'A1', q: 'Jag är positiv till att spela in postural orientering hos min patient/idrottare med POE appen' },
            { code: 'A2', q: 'Jag är positiv till att dela med mig av min patients/idrottares data om postural orientering för forskningsändamål.' },
            { code: 'A3', q: 'Jag vill ha tillgång till och kunna granska min patients/idrottares data.' },
            { code: 'A4', q: 'Jag vill att min patient/idrottare ska ha tillgång till och kunna granska sin data.' },
            { code: 'A5', q: 'Jag vill att mina kollegor ska ha tillgång till och kunna granska data.' },
            { code: 'BI1', q: 'Jag har för avsikt att använda POE appen under hela studiens gång.' },
            { code: 'UB1', q: 'Hur skulle du beskriva din användning av POE appen?' },
            { code: 'UB2', q: 'Vilka svårigheter (om några) upplevde du när du använde POE appen?' }
        ]
    },
    patient: {
        T1: [
            { code: 'PU1', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa mig att hantera min fysiska hälsa' },
            { code: 'PU2', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min prestation.' },
            { code: 'PEOU1', q: 'Jag tror att det kommer vara enkelt att se och tolka resultatet i POE appen.' },
            { code: 'A1', q: 'Jag är positiv till att spela in min posturala orientering med POE appen.' },
            { code: 'A2', q: 'Jag är positiv till att dela med mig av min data om postural orientering för forskningsändamål.' },
            { code: 'A3', q: 'Jag vill ha tillgång till och kunna granska min data.' },
            { code: 'A4', q: 'Jag vill att min fysioterapeut/tränare ska ha tillgång till och kunna granska min data.' },
            { code: 'BI1', q: 'Jag har för avsikt att använda POE appen under hela studiens gång.' }
        ],
        T2: [
            { code: 'PU1', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa mig att hantera min fysiska hälsa.' },
            { code: 'PU2', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min prestation.' },
            { code: 'PEOU1', q: 'Jag tycker att det är enkelt att se och tolka resultatet i POE appen.' },
            { code: 'A1', q: 'Jag är positiv till att spela in min posturala orientering med POE appen.' },
            { code: 'A2', q: 'Jag är positiv till att dela med mig av min data om postural orientering för forskningsändamål.' },
            { code: 'A3', q: 'Jag vill ha tillgång till och kunna granska min data.' },
            { code: 'A4', q: 'Jag vill att min fysioterapeut/tränare ska ha tillgång till och kunna granska min data.' },
            { code: 'BI1', q: 'Jag har för avsikt att använda POE appen under hela studiens gång.' },
            { code: 'UB1', q: 'Hur skulle du beskriva din användning av POE appen?' },
            { code: 'UB2', q: 'Vilka svårigheter (om några) upplevde du när du använde POE appen?' }
        ],
        T3: [
            { code: 'PU1', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa mig att hantera min fysiska hälsa.' },
            { code: 'PU2', q: 'Jag tror att mätning av postural orientering med POE appen sannolikt kommer att hjälpa till att förbättra min prestation.' },
            { code: 'PEOU1', q: 'Jag tycker att det är enkelt att se och tolka resultatet i POE appen.' },
            { code: 'A1', q: 'Jag är positiv till att spela in min posturala orientering med POE appen.' },
            { code: 'A2', q: 'Jag är positiv till att dela med mig av min data om postural orientering för forskningsändamål.' },
            { code: 'A3', q: 'Jag vill ha tillgång till och kunna granska min data.' },
            { code: 'A4', q: 'Jag vill att min fysioterapeut/tränare ska ha tillgång till och kunna granska min data.' },
            { code: 'BI1', q: 'Jag har för avsikt att använda POE appen under hela studiens gång.' },
            { code: 'UB1', q: 'Hur skulle du beskriva din användning av POE appen?' },
            { code: 'UB2', q: 'Vilka svårigheter (om några) upplevde du när du använde POE appen?' }
        ]
    },
    choices: {
        scales: [
            'Instämmer inte alls',
            'Instämmer i liten grad',
            'Varken instämmer eller inte',
            'Instämmer i hög grad',
            'Instämmer helt'
        ],
        text: {
            label: 'Skriv ditt svar',
            hint: 'Valfri. Fritextfråga'
        }
    }
}
