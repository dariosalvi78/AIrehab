
export default {
    login: 'Log in',
    logout: 'Logout',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    send: 'Send',
    continue: 'Continue',
    delete: 'Delete',
    signin: 'Sign-in',
    email: 'Email',
    password: 'Password',
    forgot_password: 'Forgot password',
    header: {
        language: 'Language',
        about: 'About',
        consent: 'Change consent'
    },
    password_reset: {
        title: 'Password reset',
        desc: 'Password reset link will be sent to <b>{email}</b>.<br/> Follow the instructions in the email.',
        reset: 'Reset password',
        go_back: 'Go back',
        password_hint: 'New password',
        password_error: 'Password is needed',
        password_confirm: 'Confirm password',
        password_confirm_hint: 'Must be the same password',
        password_confirm_error: 'Please enter the same password'
    },
    exercise: 'Exercise | Exercises',
    delete_session: 'Delete session',
    start_exercise: 'Start new exercise',
    go_to_exercise: 'Go to exercise',
    patient_list: 'Patients list',
    session_list: 'Sessions',
    add_to_homescreen: 'Add to Home screen',
    consent: {
        information_letter: 'Information letter',
        read_information: 'Read information letter',
        header: 'Participation in research study',
        description: `
            We need to have your consent to participate in this study. Please read the information letter before making your decision.
            <br><br>Your participation can be changed at anytime.
        `,
        confirm_description: 'Once you have made your decision, check the box below.',
        confirm_checkbox: 'I agree to the terms in the information letter',
        continue_to_survey: 'Continue to questionnaire' 
    },
    new_survey: {
        header: 'A new survey is available',
        description: 'As part of this study, you will be asked to complete a few surveys. A new survey has been made available on {date}.<br><br>After you have submitted your answers, you can continue to use the POE app.',
        action: 'Go to latest survey'
    },
    new_user: {
        header: 'Welcome to POE assessment!',
        description: 'Before you can continue, you need to create an account by entering a password. Your account will be created after you submit your details.<br><br>Please enter your login details below.',
        form: {
            email: 'Email',
            email_hint: 'Your email for login',
            email_error: 'Please enter a valid email',
            password: 'Password',
            password_hint: 'Enter a password {feedback}',
            password_error: 'Enter a password that contains at least 8 characters, one uppercase & lowercase letter, one number, and one special character.',
            password_error_weak: 'Enter a stronger password with at least 8 characters',
            password_confirm: '@:common.password_reset.password_confirm',
            password_confirm_hint: '@:common.password_reset.password_confirm_hint',
            password_confirm_error: '@:common.password_reset.password_confirm_error'
        },
        password_check: {
            warnings: {
                lowScore: 'Password is not strong enough.',
                common: 'This is a very common password.',
                similarCommon: 'This is similar to a commonly used password.',
                repeated: 'Repeats like "abcabc" are only slightly harder to guess than "abc"',
                commonNames: 'Common names and surnames are easy to guess.'
            },
            score: {
                medium: 'Accepted password',
                high: 'Good password'
            }
        },
        create: 'Create account',
        suggestion: 'Add another word or two. Uncommon words are better.'
    },
    notification: {
        error: 'Please review fields and try again',
        error_generic: 'Error message: ',
        login_error: 'Login failed: {error}',
        login_missing: 'Enter email and password',
        login_wrong: 'Wrong credentials',
        account_created: 'Your accounts has been created',
        account_error: 'Could not create account: {error}',
        invitation_expired: 'The link has expired, contact the administrator.',
        password_reset_email: 'Please enter your email address.',
        password_updated: 'Your password has been updated',
        password_updated_error: 'Could not reset password: {error}',
        password_same_error: 'Can not use same password as old one',
        password_reset_sent: 'Password reset link has been sent, check your inbox',
        update_consent_status: 'Updated consent status',
        update_consent_status_error: 'Could not update user consent: {error}',
        copied_to_clipboard: 'Verification link copied to clipboard'
    }
}