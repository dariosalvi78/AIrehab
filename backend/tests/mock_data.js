const mock = {
    physiotherapist: {
        id: 1,
        email: "email@test.com",
        hashedPassword: "password",
        role: "physiotherapist",
        createdTimestamp: "177718530000"
    },
    patient: {
        id: 2,
        names: "test name",
        dateOfBirth: "177718530000",
        height: 170,
        weight: 75,
        injuries: "description of injuries..."
    },
    sessions: [
        {
            sessionID: 1,
            sessionStartTimestamp: "177718530000",
            patientId: 2,
            numOfExercises: 1
        }
    ],
    exercises: [
        {
            id: 1,
            type: "test",
            notes: "exercise 1... (no video)",
            videoFile: null,
            physiotherapySessionId: 1
        },
        {
            id: 2,
            type: "test2",
            notes: "exercise 2... (with video)",
            videoFile: "filename.mp4",
            physiotherapySessionId: 2,
            endTimestamp: "177718530000"
        },
        {
            id: 3,
            type: "singleLeggedSquatLeft",
            notes: "exercise 3...",
            videoFile: null,
            physiotherapySessionId: 1,
            endTimestamp: "177718530000"
        }
    ],
    poe: {
        id: 1,
        exerciseId: 1,
        patientId: 2,
        score: 2,
        posturalOrientation: 'kneeMedialToFootPosition',
        confidence0: 85,
        confidence1: 0,
        confidence2: 0,
        repetition: 0
    },
    db: {
        server: "localhost",
        database: undefined,
        user: "airehab",
        password: "MyPassword_1234",
        port: 1433,
        options: { encrypt: false }
    }
}

export default mock
