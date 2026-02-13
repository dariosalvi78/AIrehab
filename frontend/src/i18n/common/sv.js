
export default {
    login: 'Logga in',
    logout: 'Logga ut',
    cancel: 'Avbryt',
    close: 'Stäng',
    confirm: 'Bekräfta',
    send: 'Skicka',
    continue: 'Fortsätt',
    delete: 'Ta bort',
    signin: 'Inloggning',
    email: 'E-postadress',
    password: 'Lösenord',
    forgot_password: 'Glömt lösenord',
    home: 'Hem',
    go_back: 'Gå tillbaka',
    header: {
        language: 'Språk',
        about: 'Mer info',
        consent: 'Ändra samtycke'
    },
    tabs: {
        patients: 'Dina patienter',
        sessions: 'Alla sessioner'
    },
    password_reset: {
        title: 'Lösenordsåterställning',
        desc: 'Lösenordsåterställningslänk kommer att skickas till <b>{email}</b>.<br/> Följ instruktionerna som finns i mejlet.',
        reset: 'Återställ lösenord',
        go_back: 'Gå tillbaka',
        password_hint: 'Nytt password',
        password_error: 'Ange lösenord',
        password_confirm: 'Bekräfta lösenord',
        password_confirm_hint: 'Måste vara samma lösenord',
        password_confirm_error: 'Vänligen ange samma lösenord'
    },
    exercise: 'Övning | Övningar',
    delete_session: 'Ta bort session',
    start_exercise: 'Påbörja ny övning',
    go_to_exercise: 'Gå till övning',
    patient_list: 'Patient lista',
    session_list: 'Sessioner',
    add_to_homescreen: 'Lägg till på Hemskärmen',
    consent: {
        information_letter: 'Bedömning av rörelsekvalitet via en mobilapplikation',
        read_information: 'Öppna ”Information till forskningspersoner: Bedömning av rörelsekvalitet via en mobilapplikation”',
        header: 'Samtycke till att delta i projektet',
        description: `
            Jag har fått muntlig och/eller skriftligen information om studien som getts via ”Information till forskningspersoner: Bedömning av rörelsekvalitet via en mobilapplikation”.
            <br><br>
            Jag har fått möjlighet att ställa frågor och har fått information om vem jag ska vända mig till vid fler frågor
            <br><br>
            Jag har fått information om att deltagandet i studien är frivilligt, att jag kan avbryta när jag vill utan att ange anledning samt välja att delta i alla eller enstaka delar av studien.
        `,
        confirm_description: 'När du har fattat ditt beslut, kryssa i rutan nedan.',
        confirm_checkbox: 'Jag samtycker till att delta i studien ”Bedömning av rörelsekvalitet via en mobilapplikation”',
        continue_to_survey: 'Fortsätt till frågeformulär' 
    },
    new_survey: {
        header: 'En ny enkät är tillgänglig',
        description: 'Som en del av denna studie så kommer du att få svara på ett par enkäter. Det finns en ny enkät som har blivit tillgänglig {date}.<br><br>Efter att du har skickat in dina svar, så kan du fortsätta att använda POE appen.',
        action: 'Gå till senaste enkäten'
    },
    new_user: {
        header: 'Välkommen till POE assessment!',
        description: 'Innan du kan fortsätta så behöver du skapa konto genom att ange ett lösenord. Ditt konto kommer att skapas efter du har skickat in dina uppgifter.<br><br>Vänligen ange dina inloggningsuppgifter nedan.',
        form: {
            email: 'E-postadress',
            email_hint: 'Din e-postadress för inloggning',
            email_error: 'Vänligen ange giltig e-postadress',
            password: 'Lösenord',
            password_hint: 'Ange ett lösenord {feedback}',
            password_error: "Ange ett lösenord som innehåller minst 8 tecken, en stor & liten bokstav, en siffra & ett specialtecken",
            password_error_weak: 'Ange ett starkare lösenord med minst 8 tecken',
            password_confirm: '@:common.password_reset.password_confirm',
            password_confirm_hint: '@:common.password_reset.password_confirm_hint',
            password_confirm_error: '@:common.password_reset.password_confirm_error'
        },
        password_check: {
            warnings: {
                lowScore: 'Lösenordet är inte tillträckligt starkt.',
                common: 'Detta är ett väldigt vanligt lösenord.',
                similarCommon: 'Detta liknar ett vanligt lösenord.',
                repeated: 'Undvik att använda upprepningar på tecken.',
                commonNames: 'Vanliga namn är lätta att gissa.'
            },
            score: {
                medium: 'Godkänt lösenord',
                high: 'Bra lösenord'
            }
        },
        create: 'Skapa konto',
        suggestion: 'Lägg till ett eller två ord till. Ovanliga ord är bättre.'
    },
    notification: {
        error: 'Vänligen kontrollera fälten och försök igen',
        error_generic: 'Felmeddelande: {error}',
        login_error: 'Inloggning misslyckades: {error}',
        login_missing: 'Ange e-postadress och lösenord',
        login_wrong: 'Felaktiga inloggningsuppgifter',
        account_created: 'Ditt konto har skapats',
        account_error: 'Kunde inte skapa konto: {error}',
        invitation_expired: 'Länken är inte giltig längre, kontakta administratör.',
        password_reset_email: 'Vänligen ange din e-postadress.',
        password_updated: 'Ditt lösenord har uppdaterats.',
        password_updated_error: 'Kunde inte uppdatera lösenord: {error}',
        password_same_error: 'Får inte vara samma lösenord som gamla',
        password_reset_sent: 'Mejl med lösenordsåterställning har skickats, se din e-post inkorg.',
        update_consent_status: 'Du har godkänt till att delta i studien | Du har tagit bort ditt medgivande till studien',
        update_consent_status_error: 'Kunde inte uppdatera medgivande: {error}',
        copied_to_clipboard: 'Verifieringslänk kopierad till urklipp',
        session_expired: 'Sessionen har gått ut, vänligen logga in igen'
    }
}