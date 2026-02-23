
export default {
    actions: {
        new_user: 'Add new Test leader',
        new_patient: 'Add new Patient',
        download_data: 'Download survey data'
    },
    table: {
        user: {
            test_leaders: 'Test leaders',
            patients: 'Patients',
            header: 'Users',
            columns: {
                username: 'Email',
                type: 'Type',
                created: 'Created',
                last_login: 'Last log in'
            },
            actions: {
                add: { header: 'Add', caption: 'Assign patient to Test leader' },
                delete: { header: 'Delete', caption: 'Permanently delete {email}',
                    body: `
                        User will be permanently deleted.<br><br>
                        <b>User:</b> {email}<br>
                        <b>Created:</b> {created}<br>
                        <b>Role:</b> {role}
                    `
                },
                email: { header: 'Message', caption: 'Send email to user' },
                edit: { header: 'Edit', caption: 'Edit information for {name}' },
                copy: { header: 'Verification', caption: 'Copy verification link to clipboard' }
            }
        },
        session: {
            sessions: 'Sessions',
            header: 'Sessions',
            columns: {
                patient: '@:admin.table.user.columns.username',
                exercises: '@:admin.table.exercise.exercises',
                end: 'End date',
                created: 'Created',
            },
            actions: {
                delete: {
                    header: 'Delete session', caption: 'Delete session created at {date}',
                    body: 'The session will be permanently removed<br><br><b>ID: </b>{id}<br><b>Created:</b> {created}'
                },
            }
        },
        exercise: {
            exercises: 'Exercises',
            header: '@:admin.table.exercise.exercises',
            columns: {
                patient: 'Patient',
                assigned_to: 'Test leader',
                type: 'Type of övning',
                created: 'Created',
            },
            actions: {
                read: { header: 'Exercise information', caption: 'Read notes' },
                delete: {
                    header: 'Delete exercise', caption: 'Delete exercise permanently {type}',
                    body: `Exercise will be permanently removed.<br><br>
                        <b>Type of exercise</b> {type}<br>
                        <b>Test leader:</b> {assigned_to}<br>
                        <b>Patient:</b> {name}<br>
                        <b>Date:</b> {created} - {end}<br>
                        <b>Video:</b> {videoFile}<br>
                    `
                },
            }
        }
    },
    dialog: {
        new_user: {
            header: 'Create new user',
            description: 'Add a new user (Test leader).<br>Account details & instructions will be sent to the specified email.',
            form: {
                email: 'Email',
                email_error: 'Please enter a valid email',
                password: 'Password',
                password_hint: 'Password for user {feedback}',
                password_confirm: '@:common.password_reset.password_confirm',
                password_confirm_hint: '@:common.password_reset.password_confirm_hint',
                password_confirm_error: '@:common.password_reset.password_confirm_error'
            }
        },
        email: {
            header: 'New email',
            description: 'Send email from POE app to user<br><br><b>Recipient:</b> {email}',
            form: {
                subject: 'Subject',
                subject_error: 'Email must contain subject',
                content: 'Content',
                content_error: 'Please enter email content'
            }
        }
    },
    video: {
        uploaded: 'No recording | Recording exists',
    },
    notification:{
        sending_invitation: 'Sending invitation, please wait',
        invitation_sent: 'Invitation sent to {email}',
        invitation_sent_error: 'Could not send invitation: {error}',
        get_users_error: 'Could not get users: {error}',
        no_data_available: 'No data is available for download',
        email_sent: 'Email has been sent to {email}',
        email_sent_error: 'Cannot send email: {error}',
        delete_user: 'Deleted {username}',
        delete_user_error: 'Could not delete {username}: {error}',
        user_not_found: '{username} does not exist'
    }
}