
export default {
    add: 'Lägg till ny patient',
    edit: 'Redigera patient',
    start: 'Starta session',
    ongoing: 'Pågående session',
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