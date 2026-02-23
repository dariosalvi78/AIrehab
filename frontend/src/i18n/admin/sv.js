
export default {
    actions: {
        new_user: 'Lägg till ny Test leader',
        new_patient: 'Lägg till ny patient',
        download_data: 'Ladda ner undersökningsdata'
    },
    table: {
        user: {
            test_leaders: 'Test leaders',
            patients: 'Patienter',
            header: 'Användare',
            columns: {
                username: 'E-postadress',
                type: 'Typ',
                created: 'Skapad',
                last_login: 'Senaste inloggning'
            },
            actions: {
                add: { header: 'Lägg till', caption: 'Tilldela patient till användare' },
                delete: { header: 'Ta bort', caption: 'Ta bort permanent {email}',
                    body: `
                        Användaren kommer att tas bort permanent.<br><br>
                        <b>Användare:</b> {email}<br>
                        <b>Skapad:</b> {created}<br>
                        <b>Roll:</b> {role}
                    `
                },
                email: { header: 'Meddelande', caption: 'Skicka mejl till användare' },
                edit: { header: 'Redigera', caption: 'Redigera information för {name}' },
                copy: { header: 'Verifikation', caption: 'Kopiera verifikationslänk' }
            }
        },
        session: {
            sessions: 'Sessioner',
            header: 'Sessioner',
            columns: {
                patient: '@:admin.table.user.columns.username',
                exercises: '@:admin.table.exercise.exercises',
                end: 'Slutdatum',
                created: 'Skapad',
            },
            actions: {
                delete: {
                    header: 'Ta bort session', caption: 'Ta bort session skapad den {date}',
                    body: 'Session kommer att tas bort permanent<br><br><b>ID: </b>{id}<br><b>Skapad:</b> {created}'
                },
            }
        },
        exercise: {
            exercises: 'Övningar',
            header: '@:admin.table.exercise.exercises',
            columns: {
                patient: 'Patient',
                assigned_to: 'Test leader',
                type: 'Typ av övning',
                created: 'Skapad',
            },
            actions: {
                read: { header: 'Övningsinformation', caption: 'Läs anteckningar' },
                delete: {
                    header: 'Ta bort övning', caption: 'Ta bort övning permanent {type}',
                    body: `Övningen kommer att tas bort permanent.<br><br>
                        <b>Typ av övning</b> {type}<br>
                        <b>Test leader:</b> {assigned_to}<br>
                        <b>Patient:</b> {name}<br>
                        <b>Datum:</b> {created} - {end}<br>
                        <b>Video:</b> {videoFile}<br>
                    `
                },
            }
        }
    },
    dialog: {
        new_user: {
            header: 'Skicka inbjudan till användare',
            description: 'Lägg till en ny användare (Test leader). Instruktioner för hur man skapar sina inloggningsuppgifter skickas till den angivna e-postadressen.'
        },
        email: {
            header: 'Nytt e-postmeddelande',
            description: 'Skicka e-post från POE app till användare<br><br><b>Mottagare:</b> {email}',
            form: {
                subject: 'Ämne',
                subject_error: 'E-postmeddelande måste innehålla ett ämne',
                content: 'Innehåll',
                content_error: 'Vänligen ange innehåll i meddelandet'
            }
        }
    },
    video: {
        uploaded: 'Ingen inspelning finns | Inspelning finns',
    },
    notification:{
        sending_invitation: 'Skickar inbjudan, vänligen vänta',
        invitation_sent: 'Inbjudan skickad till {email}',
        invitation_sent_error: 'Kunde inte skicka inbjudan: {error}',
        get_users_error: 'Kunde inte hämta användare: {error}',
        no_data_available: 'Det finns ingen undersökningsdata att hämta',
        email_sent: 'E-post skickat till {email}',
        email_sent_error: 'Kunde inte skicka e-post: {error}',
        delete_user: 'Raderade {username}',
        delete_user_error: 'Kunde inte radera {username}: {error}',
        user_not_found: '{username} finns inte'
    }
}