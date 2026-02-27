
export default {
    name: 'Övningar',
    go_exercise: 'Gå till övning',
    go_evaluation: 'Gå till utvärdering',
    edit_exercise: 'Redigera övning',
    ongoing: 'Pågående övning',
    form: {
        title_add: 'Lägg till ny övning',
        title_edit: 'Redigera övning',
        type: 'Typ av övning',
        type_hint: 'Övning som kommer att användas för bedömning',
        type_error: 'Vänligen ange övningstypen',
        notes: 'Anteckningar',
        notes_hint: 'Valfri. Anteckningar för övning',
        notes_error: 'Anteckningsgräns nådd',
        uploaded: 'Uppladdad träningsvideo',
        types: {
            singleLeggedSquatLeft: 'Enbensknäböj (Vänster)',
            singleLeggedSquatRight: 'Enbensknäböj (Höger)'
        }
    },
    record: {
        title: 'Filma ny övning för POE bedömning',
        no_device: 'Enheten har ingen kamera att filma med',
        reconnect: 'Återanslut kamera',
        open_camera: 'Öppna kamera',
        dialog: {
            title: 'Spela in träningsvideo',
            start: 'Börja inspelning',
            stop: 'Stoppa inspelning',
            save: '(Valfri) Spara inspelning till enhet',
            auto_stop: '(Valfri) Avsluta inspelningen efter {elapsed} sekunder'
        },
        upload: 'Ladda upp träningsvideo',
        upload_desc: 'Ladda upp video som du har filmat sen tidigare',
        recorded: 'Inspelad',
        size: 'Storlek',
        begin: 'Påbörja övningsbedömning'
    },
    results: {
        processing: 'Förbereder video',
        processing_info: 'Inspelning är inskickad för analysering, observera att detta kan ta en stund. AI-modellen är under utveckling och kommer att förbättras under studiens gång.<br><br>När ditt resultat är redo så skickas ett mejl till dig.',
        retrieving: 'Hämtar resultat från analyserad video',
        title: 'Utvärdering av övning',
        description: 'Resultat från inspelad träningsvideo',
        preview_video: 'Förhandsvisa inspelad övning',
        review_video: 'Granska inspelad övning',
        recording_not_found: 'Kunde inte hitta inspelad video'
    },
    sessions: {
        title: 'Session för {name}',
        exercise: 'övning | övningar',
        no_exercises: 'Inga övningar',
        no_exercises_in_session: 'Inga övningar i denna session',
        no_end_date: 'Inget slutdatum',
        not_found: 'Inga sessioner hittades'
    },
    instructions: {
        title: 'Övningsinstruktioner',
        watch: 'Se övningsdemonstration',
        content:
            `
            <b>Genomförande av övning</b><br>
            Placera något bakom personen som ska testas, exempelvis en låda eller brits så att knät är böjt till ca 60-70 grader i det djupaste läget. 
            Be personen placera foten rakt (gärna på en längsgående linje), lyfta det andra benet från golvet och låta armarna hänga längs sidorna.
            <br><br>
            <b>Ge följande instruktion till personen</b><br>
            Böj långsamt i knät tills du nuddar britsen/lådan med sätet utan att sätta dig ner, återgå till startposition. En enbensknäböjning ska ta ungefär 3 sekunder. Upprepa 5 gånger.
            <br><br>
            <b>Placering och filmning</b><br>
            Filma personen rakt framifrån med mobilen/läsplatta i stående format, se till så att hela kroppen kommer med i videon. Placera helst telefonen/läsplattan på något stabilt underlag när du spelar in filmen.
        `
    },
    notification: {
        created_test_exercise: 'Skapade tillfällig övning',
        get_exercises_error: 'Kan inte hämta övningar: {error}',
        add_exercise: 'Skapade ny övning för nuvarande session',
        add_exercise_error: 'Kunde inte skapa ny övning: {error}',
        exercise_not_found: 'Kan inte hitta övning',
        delete_exercise: 'Övning har tagits bort',
        delete_exercise_error: 'Kunde inte ta bort övning från session: {error}',
        update_exercise: 'Uppdaterade övning för session',
        update_exercise_error: 'Kunde inte uppdatera övning: {error}',
        get_sessions_error: 'Något gick fel vid hämtning av sessioner: {error}',
        session_not_found: 'Hittade ingen session med angivna ID:et',
        get_session_error: 'Kan inte hämta nuvarande session: {error}',
        update_session_error: 'Något gick fel vid uppdatering av session: {error}',
        session_deleted: 'Session har blivit borttagen',
        session_deleted_error: 'Kan inte ta bort session: {error}',
        session_ongoing: 'Sessionen har pågående övningar',
        add_session: 'Skapade ny session för: {name}',
        add_session_error: 'Kunde inte skapa ny session: {error}',
        user_consent_missing: 'Måste ge medgivande till studie för denna åtgärd',
        patient_consent_missing: 'Patient har inte gett medgivande till deltagande i övning',
        video_not_available: 'Video är inte tillgänglig: {error}',
        recording_error: 'Inspelningsfel: {error}',
        camera_not_available: 'Bakkamera ej tillgänglig: {error}',
        uploading_video: 'Laddar upp video till servern, vänligen vänta...',
        uploading_video_error: 'Inspelning kan inte sparas: {error}',
        video_upload_success: '<b>Inspelning är redo</b><br>Påbörjar videoanalys inom kort<br>Vänligen vänta...',
        processing_started: 'Videon har skickats för analysering',
        upload_rejected: 'Filen har inte ett giltigt format: {file}',
        web_recording_not_supported: 'Webbläsaren har inte stöd för .mp4 inspelning, prova en annan webbläsare.'
    }
}