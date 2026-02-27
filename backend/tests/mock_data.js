const mock = {
    physiotherapist: {
        id: 1,
        email: "email@test.com",
        hashedPassword: "password",
        role: "physiotherapist",
        createdTimestamp: "177718530000",
        activated: true
    },
    patient: {
        id: 2,
        names: "test name",
        dateOfBirth: "177718530000",
        height: 170,
        weight: 75,
        injuries: {
            description: "description of injuries...",
            injuredBodyParts: { left: ['foot', 'knee'], right: ['hip'] }
        }
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
    surveys: [
        { id: 1, surveyName: 'T1', createdTimestamp: new Date() },
        { id: 2, surveyName: 'T2', createdTimestamp: new Date() }
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
    },
    poe_results: {
        femval: {
            pred: 1,
            conf: [
                0.0,
                0.4567604302040612,
                0.24910034139954584
            ],
            detailed: [
                [
                    0.0,
                    0.4162876003344233,
                    0.25119712948799144
                ],
                [
                    0.0,
                    0.28382548635515076,
                    0.39796245098114935
                ],
                [
                    0.0,
                    0.49085659285386407,
                    0.31341100732485494
                ],
                [
                    0.0,
                    0.6373581538597743,
                    0.28293111920373354
                ],
                [
                    0.0,
                    0.45547431761709356,
                    0.0
                ]
            ]
        },
        trunk: {
            pred: 1,
            conf: [
                0.15582806865374246,
                0.5621079971823758,
                0.040074657648801804
            ],
            detailed: [
                [
                    0.0,
                    0.8200730383396148,
                    0.20037328824400902
                ],
                [
                    0.22900261481602985,
                    0.5134107140203317,
                    0.0
                ],
                [
                    0.29081930716832477,
                    0.4543768698330552,
                    0.0
                ],
                [
                    0.0,
                    0.4601304479253788,
                    0.0
                ],
                [
                    0.25931842128435767,
                    0.5625489157934983,
                    0.0
                ]
            ]
        },
        hip: {
            pred: 1,
            conf: [
                0.13895318251611571,
                0.5414164787922345,
                0.0
            ],
            detailed: [
                [
                    0.20741398662426036,
                    0.22667450011722395,
                    0.0
                ],
                [
                    0.0,
                    0.7517311781644822,
                    0.0
                ],
                [
                    0.21809925502748229,
                    0.7397965393960475,
                    0.0
                ],
                [
                    0.0,
                    0.38973991312086587,
                    0.0
                ],
                [
                    0.26925267092883587,
                    0.5991402631625533,
                    0.0
                ]
            ]
        },
        kmfp: {
            pred: 0,
            conf: [
                0.5325483224665124,
                0.2171841859817505,
                0.0
            ],
            detailed: [
                [
                    0.5438925242439533,
                    0.0,
                    0.0
                ],
                [
                    0.5155465327358494,
                    0.24614285677671432,
                    0.0
                ],
                [
                    0.41111937976287055,
                    0.6040835628906887,
                    0.0
                ],
                [
                    0.49077220649148023,
                    0.23569451024134955,
                    0.0
                ],
                [
                    0.7014109690984089,
                    0.0,
                    0.0
                ]
            ]
        },
        fms: {
            pred: 0,
            conf: [
                1, 
                0, 
                0
            ],
            detailed: [
                [0.6047852203249932, 0, 0],
                [0.5995569964227456, 0, 0],
                [0.9999918460845947, 0, 0],
                [0.6190218448638916, 0, 0],
                [0.9999541521072388, 0, 0]
            ]
        }
    }
}

export default mock
