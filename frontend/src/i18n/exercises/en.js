
export default {
    name: 'Exercises',
    go_exercise: 'Go to exercise',
    go_evaluation: 'Go to Evaluation',
    edit_exercise: 'Edit exercise',
    ongoing: 'Ongoing exercise',
    form: {
        title_add: 'Add new exercise',
        title_edit: 'Edit exercise',
        type: 'Type of exercise',
        type_hint: 'Exercise that will be used for evaluation',
        type_error: 'Please enter the type of exercise',
        notes: 'Notes',
        notes_hint: 'Optional. Notes for exercise',
        notes_error: 'Notes limit reached',
        uploaded: 'Uploaded video',
        types: {
            singleLeggedSquatLeft: 'Single-leg Squat (Left)',
            singleLeggedSquatRight: 'Single-leg Squat (Right)'
        }
    },
    record: {
        title: 'Record new exercise for POE assessment',
        no_device: 'Device has no video inputs',
        reconnect: 'Reconnect video',
        open_camera: 'Open camera',
        dialog: {
            title: 'Record exercise video',
            start: 'Start recording',
            stop: 'Stop recording',
            save: '(Optional) Save video to device'
        },
        upload: 'Upload exercise video',
        upload_desc: 'Upload video that you have already recorded',
        recorded: 'Recorded',
        size: 'Size',
        begin: 'Begin exercise assessment'
    },
    results: {
        processing: 'Processing video',
        processing_info: 'The recording has been submitted for analysis. Please note that this may take some time.<br><br>When your results are ready, an email will be sent to you.',
        retrieving: 'Retrieving results from analysed video',
        title: 'Video Evaluation',
        description: 'Results from recorded exercise video',
        preview_video: 'Preview recorded exercise',
        review_video: 'Review recorded exercise',
        recording_not_found: 'Exercise video was not found'
    },
    sessions: {
        title: 'Session for {name}',
        exercise: 'exercise | exercises',
        no_exercises: 'No exercises',
        no_exercises_in_session: 'No exercises in session',
        no_end_date: 'No end date',
        not_found: 'No sessions found',
        does_not_exist: 'Session does not exist'
    },
    instructions: {
        title: 'Exercise instructions',
        watch: 'Watch exercise demonstration',
        content:
            `
            <b>How to perform exercise</b><br>
            Place something behind the person being tested, e.g., a box or bench, so that the knee is bent to about 60-70 degrees at the lowest position. 
            Ask the person to place the foot straight (preferably on a longitudinal line), keep the other leg lifted, and let the arms hang by the sides. 
            <br><br>
            <b>Instruct the person the following</b><br>
            Slowly bend your knee until your buttocks touches the bench/box without sitting down, then return to the starting position. One single-leg squat should take about 3 seconds. Repeat 5 times. 
            <br><br>
            <b>Placement and recording</b><br>
            Record the participant from the front with a mobile phone/tablet in portrait mode, making sure the whole body is visible in the video. Ideally, place the phone/tablet on a stable surface while recording. 
        `
    },
    notification: {
        created_test_exercise: 'Created temporary test exercise',
        get_exercises_error: 'Could not retrieve exercises: {error}',
        add_exercise: 'Created new exercise for current session',
        add_exercise_error: 'Creating new exercise failed: {error}',
        delete_exercise: 'Exercise has been deleted',
        delete_exercise_error: 'Cannot delete exercise from session: {error}',
        update_exercise: 'Updated exercise for current session',
        update_exercise_error: 'Could not update exercise: {error}',
        get_sessions_error: 'Something went wrong when retrieving sessions: {error}',
        session_not_found: 'Found no session with the given ID',
        get_session_error: 'Cannot fetch current session: {error}',
        update_session_error: 'Something went wrong when updating session: {error}',
        session_deleted: 'Session has been deleted',
        session_deleted_error: 'Cannot delete session: {error}',
        session_ongoing: 'Session has ongoing exercises',
        add_session: 'Created new session for: {name}',
        add_session_error: 'Creating new session failed: {error}',
        user_consent_missing: 'Must give consent to study to perform this action',
        patient_consent_missing: 'Patient has not consented to be part of exercise',
        video_not_available: 'Video not available: {error}',
        recording_error: 'Recording error: {error}',
        camera_not_available: 'Rear-facing camera not available: {error}',
        uploading_video: 'Uploading video to server, please wait...',
        uploading_video_error: 'Video cannot be saved: {error}',
        video_upload_success: '<b>Video uploaded</b><br>Processing will start in a moment<br>Please wait...',
        processing_started: 'Video has been sent for processing',
        get_video_exercise: 'Cannot get exercise: {error}',
        upload_rejected: 'File is not in a valid format: {file}',
        web_recording_not_supported: 'Browser does not support .mp4 web recording, use a different web browser.'
    }
}