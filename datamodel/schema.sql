IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[exercise]') AND type in (N'U'))
BEGIN
    CREATE TABLE exercise (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        start_timestamp datetime NOT NULL,
        end_timestamps datetime,
        physiotherapy_session_id uniqueidentifier NOT NULL,
        type varchar(50),
        video_file varchar(100),
        notes text
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patient]') AND type in (N'U'))
BEGIN
    CREATE TABLE patient (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        names text NOT NULL,
        dateofbirth date NOT NULL,
        physiotherapist_id uniqueidentifier NOT NULL,
        height decimal,
        weight decimal,
        injuries text,
        createdTimestamp datetime
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[physiotherapy_session]') AND type in (N'U'))
BEGIN
    CREATE TABLE physiotherapy_session (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        patient_id uniqueidentifier NOT NULL,
        start_timestamp datetime NOT NULL,
        end_timestamp datetime
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[poe_evaluation]') AND type in (N'U'))
BEGIN
    CREATE TABLE poe_evaluation (
        id uniqueidentifier NOT NULL PRIMARY KEY,
        exercise_id uniqueidentifier NOT NULL,
        postural_orientation varchar(100) NOT NULL,
        score int NOT NULL,
        score_confidence_0 decimal,
        score_confidence_1 decimal,
        score_confidence_2 decimal,
        repetition int
    );
END

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

ALTER TABLE exercise ADD CONSTRAINT exercise_physiotherapy_session_id_fk FOREIGN KEY (physiotherapy_session_id) REFERENCES physiotherapy_session (id);
ALTER TABLE physiotherapy_session ADD CONSTRAINT physiotherapy_session_patient_id_fk FOREIGN KEY (patient_id) REFERENCES patient (id);
ALTER TABLE poe_evaluation ADD CONSTRAINT poe_evaluation_exercise_id_fk FOREIGN KEY (exercise_id) REFERENCES exercise (id);
ALTER TABLE patient ADD CONSTRAINT patient_physiotherapist_id_fk FOREIGN KEY (physiotherapist_id) REFERENCES [user] (id);