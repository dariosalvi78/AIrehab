
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user]') AND type in (N'U'))
BEGIN
    CREATE TABLE [user] (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        email varchar(100) NOT NULL,
        hashedpassword varchar(100) NOT NULL,
        role varchar(50) NOT NULL,
        createdTimestamp datetime NOT NULL,
        lastLoginTimestamp datetime
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patient]') AND type in (N'U'))
BEGIN
    CREATE TABLE patient (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        names text NOT NULL,
        dateofbirth date NOT NULL,
        physiotherapistId uniqueidentifier NOT NULL,
        height decimal,
        weight decimal,
        injuries text,
        createdTimestamp datetime
    )
    ALTER TABLE patient ADD CONSTRAINT patient_physiotherapist_id_fk FOREIGN KEY (physiotherapistId) REFERENCES [user] (id);
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[physiotherapy_session]') AND type in (N'U'))
BEGIN
    CREATE TABLE physiotherapy_session (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        patientId uniqueidentifier NOT NULL,
        startTimestamp datetime NOT NULL,
        endTimestamp datetime
    )
    ALTER TABLE physiotherapy_session ADD CONSTRAINT physiotherapy_session_patient_id_fk FOREIGN KEY (patientId) REFERENCES patient (id);
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exercise]') AND type in (N'U'))
BEGIN
    CREATE TABLE exercise (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        startTimestamp datetime NOT NULL,
        endTimestamp datetime,
        physiotherapySessionId uniqueidentifier NOT NULL,
        type varchar(50),
        videoFile varchar(100),
        notes text
    )
    ALTER TABLE exercise ADD CONSTRAINT exercise_physiotherapy_session_id_fk FOREIGN KEY (physiotherapySessionId) REFERENCES physiotherapy_session (id);
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[poe_evaluation]') AND type in (N'U'))
BEGIN
    CREATE TABLE poe_evaluation (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        exerciseId uniqueidentifier NOT NULL,
        posturalOrientation varchar(100) NOT NULL,
        score int NOT NULL,
        scoreConfidence_0 decimal,
        scoreConfidence_1 decimal,
        scoreConfidence_2 decimal,
        repetition int
    )
    ALTER TABLE poe_evaluation ADD CONSTRAINT poe_evaluation_exercise_id_fk FOREIGN KEY (exerciseId) REFERENCES exercise (id);
END
