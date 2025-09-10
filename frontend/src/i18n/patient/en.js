
export default {
    add: 'Add new patient',
    edit: 'Edit patient',
    start: 'Start session',
    ongoing: 'Go to ongoing session',
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
        injured_part_hint: 'Part of the body that is injured'
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
    delete_confirm: 'Are you sure you want to permanently delete patient <b>{name}</b>?'
}