
export default {
    participant: "Deltagare",
    add: 'Lägg till ny patient',
    edit: 'Redigera patient',
    start: 'Starta session',
    ongoing: 'Pågående session',
    home: {
        exercise_description: 'Här kan du se dina träningsresultat',
        exercise_no_results: 'Inga träningsresultat hittades',
        survey: {
            title: 'Frågeformulär',
            description: 'Som en del av denna forskningsstudie kan du fylla i en frivillig enkät för att hjälpa oss att samla in mer information om användbarheten av POE-app.',
            available: 'Ny enkät att svara på (Digital enkät {surveyName})',
            no_results: 'Just nu så finns det inga enkäter att svara på.',
        },
        consent: {
            confirm: {
                email_required: 'E-postadress krävs',
                description: `
                    Innan du kan samtycka till att delta i studien måste du ange en e-postadress så att vi kan skicka viktiga påminnelser.
                    <br><br>
                    <b>- Genom att klicka på "@.upper:{'common.confirm'}", godkänner du villkoren i informationsbrevet.</b>
                    <br><br>
                    Vänligen ange din e-postadress nedan.
                `
            },
            withdraw: {
                title: 'Återkalla samtycke',
                description: `
                    Du är på väg att dra tillbaka ditt samtycke från denna studie.
                    Återkallande av samtycke innebär, men är inte begränsat till:
                    <br>
                    <br>- <b>Inga ytterligare uppgifter kommer att samlas in.</b>
                    <br>- <b>Din e-postadress tas bort</b>
                    <br><br>
                    Mer information finns i informationsbrevet.
                    <br><br>
                    Tryck på "@.upper:{'patient.home.consent.withdraw.title'}" knappen för att ta bort ditt samtycke till studien.
                `
            }
        }
    },
    profile: {
        measurements: 'Mått',
        dob: 'Födelsedatum',
        injuries: 'Skador',
        notes: 'Anteckningar',
        height_not_specified: 'Kroppslängd inte specificerat',
        weight_not_specified: 'Vikt inte specificerat',
        part_not_specified: 'Kroppsdel inte specificerat',
        side_not_specified: 'Skadad sida inte specificerat',
        part_of_body: 'Kroppsdel'
    },
    form: {
        type: 'Patienttyp',
        real: 'Riktig patient',
        real_desc: 'Skapa en patient som sparas',
        test: 'Testpatient',
        test_desc: 'Skapa en tillfällig patient för att testa POE-videobedömning.',
        test_patient_desc: `
            Du kan skapa en tillfällig patient om du vill testa POE-videobedömning.
            <br><br>
            Testpatienten och all dess tillhörande data tas bort när den inte används längre.
        `,
        name: 'Fullständiga namn',
        name_hint: 'Hela namnet på patienten',
        name_error: 'Vänligen ange ett kortare namn',
        date: 'Datum',
        date_hint: 'Födelsedatum',
        date_error: 'Vänligen ange ett giltigt datum',
        height: 'Längd',
        height_hint: 'Valfri. Patientens längd',
        height_error: 'Vänligen ange en giltig längd i cm',
        weight: 'Vikt',
        weight_hint: 'Valfri. Patientens vikt',
        weight_error: 'Vänligen ange en giltig vikt i kg',
        notes_hint: 'Valfri. Anteckningar / beskrivning av skador',
        injuries: 'Patient har skador',
        no_injuries: 'Patient har inga skador',
        injured_side: 'Sidan av kroppen som är skadad',
        injured_part: 'Skadad kroppsdel',
        injured_part_hint: 'Den skadade kroppsdelen'
    },
    injuries: {
        left: 'Vänster',
        right: 'Höger',
        both: 'Båda',
        foot: 'Fot',
        knee: 'Knä',
        hip: 'Bäcken',
        back: 'Rygg',
        side: 'sida skadad',
        sides: 'sidorna skadade'
    },
    not_found: 'Inga patienter hittades',
    consent: 'Patient har gett samtycke',
    no_consent: 'Patient har inte gett samtycke',
    code: 'Visa aktiveringskod',
    activate: 'Aktivera patient',
    activate_instructions: 'Din patient behöver ge samtycke för att delta i denna studie. Börja med att låta din patient skanna QR-koden nedan.',
    activate_copy: 'Kopiera verifieringslänk',
    delete: 'Ta bort patient',
    delete_confirm: 'Är du säker på att du vill permanent ta bort patienten <b>{name}</b>?'
}