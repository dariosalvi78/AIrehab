
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
                    <b>- Genom att klicka på "@:{'common.confirm'}", godkänner du villkoren i informationsbrevet.</b>
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
                    Tryck på "@:{'patient.home.consent.withdraw.title'}" knappen för att ta bort ditt samtycke till studien.
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
        name_error: 'Vänligen ange ett giltigt namn',
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
        injured_part_hint: 'Den skadade kroppsdelen',
        admin: {
            assigned_to: "Tilldelad: {email}",
            created: "Skapad: {created}",
            email: 'Test leader e-postadress',
            email_hint: 'Personen som blir tilldelad patienten'
        }
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
    delete_confirm: 'Är du säker på att du vill permanent ta bort patienten <b>{name}</b>?',
    authentication: {
        error: {
            title: 'Verifiering är inte möjligt',
            description: `
                Kunde inte verifiera att sessionen tillhör fysioterapeut/tränare.
                <br><br>Kontakta din fysioterapeut/tränare för att få skanna QR-koden igen, eller be dem att skicka verifieringslänk.
                <br><br>Om du vill kontakta administratören, hör av dig till <a href="mailto:{supportEmail}">{supportEmail}</a> 
            `
        },
        success: {
            title: 'Din personliga sida',
            description: `
                Välkommen till din personliga sida! Här kan du se dina utförda övningar, inställningar och frivilliga enkäter.<br><br>
                När du har beslutat att ge samtycke till studien så skickar vi ett e-postmeddelande till dig så att du kan hålla denna sida privat.
                <br><br>Det går också bra att lägga till denna sida som ett bokmärke för att ha smidig tillgång till dina resultat.
                <br><br>Om du behöver autentisera dig igen, kontakta din fysioterapeut/tränare för att skanna QR-koden eller skicka verifieringslänken.
            `
        }
    },
    notification: {
        add_patient: 'Ny patient tillagd',
        add_patient_error: 'Kunde inte lägga till patient: {error}',
        patient_exist_error: '{name} är redan en patient',
        get_patient_error: 'Kunde inte hämta patient: {error}',
        get_patients_error: 'Något gick fel vid hämtning av patienter: {error}',
        patient_consent_needed: 'Patienten måste samtycka till forskningsstudien innan sessionen skapas.',
        edit_patient: 'Uppdaterade patient {name}',
        edit_patient_error: 'Kunde inte uppdatera patient: {error}',
        delete_patient: 'Tog bort patient {name}',
        delete_patient_error: 'Kunde inte ta bort {name}: {error}',
        generate_url_error: 'Kan inte hämta patient länk: {error}',
        email_sent: 'Information om studien har skickats till den angivna e-postadressen',
        email_error: 'Vänligen ange en annan e-postadress',
        authentication_error: 'Det går inte att verifiera sessionen.'
    }
}