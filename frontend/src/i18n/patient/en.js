
export default {
    participant: "Participant",
    add: 'Add new patient',
    edit: 'Edit patient',
    start: 'Start session',
    ongoing: 'Go to ongoing session',
    home: {
        exercise_description: 'Here you can see your exercise results',
        exercise_no_results: 'No exercise results found',
        survey: {
            title: 'Questionnaires',
            description: 'As part of this research study you can take a short optional questionnaire to help us gather more insight of the usability and user experience of POE-app.',
            available: 'New questionnaire to answer (Digital questionnaire {surveyName})',
            no_results: 'At the moment, there are no questionnaires to complete.',
        },
        consent: {
            confirm: {
                email_required: 'Email is required',
                description: `
                    Before you can consent to participate in the study, you will need to provide an email so we can send important reminders.
                    <br><br>
                    <b>- By pressing "@.upper:{'common.confirm'}", you agree to the terms found in the information letter</b>
                    <br><br>
                    Please provide your email address below.
                `
            },
            withdraw: {
                title: 'Withdraw consent',
                description: `
                    You are about to withdraw your consent from the study.
                    Withdrawing means but not limited to:
                    <br>
                    <br>- <b>No further data will be collected from you</b>
                    <br>- <b>Your email will be removed</b>
                    <br><br>
                    More details can be found in the information letter.
                    <br><br>
                    Press the "@.upper:{'patient.home.consent.withdraw.title'}" button to remove your consent from the study.
                `
            }
        }
    },
    profile: {
        measurements: 'Measurements',
        dob: 'Date of birth',
        injuries: 'Injuries',
        notes: 'Notes',
        height_not_specified: 'Height not specified',
        weight_not_specified: 'Weight not specified',
        part_not_specified: 'Body part not specified',
        side_not_specified: 'Injured Side not specified',
        part_of_body: 'Part of the body'
    },
    form: {
        type: 'Type of patient',
        real: 'Real patient',
        real_desc: 'Create a real patient',
        test: 'Test patient',
        test_desc: 'Create a temporary mock patient for testing POE video assessment.',
        test_patient_desc: `
            You can create a temporary test patient to test the POE video assessment.
            <br><br>
            The test patient and all associated data will be deleted once its no longer in use.
        `,
        name: 'Full name',
        name_hint: 'Patient full name',
        name_error: 'Please enter a shorter name',
        date: 'Date',
        date_hint: 'Date of birth',
        date_error: 'Please enter valid date',
        height: 'Height',
        height_hint: 'Optional. Patient height',
        height_error: 'Enter valid height in cm',
        weight: 'Weight',
        weight_hint: 'Optional. Patient weight',
        weight_error: 'Enter valid weight in kg',
        notes_hint: 'Optional. Description / list of injuries',
        injuries: 'Patient has injuries',
        no_injuries: 'Patient has no injuries',
        injured_side: 'Side of the body that is injured',
        injured_part: 'Injured body part',
        injured_part_hint: 'Part of the body that is injured',
        admin: {
            assigned_to: "Assigned to: {email}",
            created: "Created: {created}",
            email: 'Test leader email',
            email_hint: 'The user who is assigned to the patient'
        }
    },
    injuries: {
        left: 'Left',
        right: 'Right',
        both: 'Both',
        foot: 'Foot',
        knee: 'Knee',
        hip: 'Pelvis',
        back: 'Back', 
        side: 'side injured',
        sides: 'sides injured'
    },
    not_found: 'No patients found',
    consent: 'Patient has given consent',
    no_consent: 'Patient has not given consent',
    code: 'Show activation code',
    activate: 'Activate patient',
    activate_instructions: 'Your patient needs to consent in order to participate in this study. Start by letting your patient scan the QR-code below.',
    activate_copy: 'Copy verification link',
    delete: 'Delete patient',
    delete_confirm: 'Are you sure you want to permanently delete patient <b>{name}</b>?',
    notification: {
        add_patient: 'Added new patient',
        add_patient_error: 'Patient registration failed: {error}',
        get_patients_error: 'Something went wrong when retrieving patients: {error}',
        patient_consent_needed: 'Patienten måste samtycka till forskningsstudien innan sessionen skapas.',
        edit_patient: 'Updated patient {name}',
        edit_patient_error: 'Patient update failed: {error}',
        delete_patient: 'Deleted patient {name}',
        delete_patient_error: 'Could not delete {name}: {error}',
        generate_url_error: 'Cannot generate patient url: {error}'
    }
}