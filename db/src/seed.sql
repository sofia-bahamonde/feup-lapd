CREATE TABLE Patient(
    id SERIAL PRIMARY KEY,
     name VARCHAR(128) NOT NULL,
     apiKey VARCHAR(256) NOT NULL,
     birthdayDate INT,
     city VARCHAR(64) NOT NULL
);

CREATE TABLE Therapist(
    id SERIAL PRIMARY KEY,
    hashedPassword VARCHAR(128),
    email VARCHAR(128) UNIQUE,
    name VARCHAR(128) NOT NULL
);

CREATE TABLE Consults(
    patientId INT,
    therapistId INT,
    
   FOREIGN KEY(patientId)
        REFERENCES Patient(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY(therapistId)
        REFERENCES Therapist(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    PRIMARY KEY(patientId,therapistId)
);

CREATE TABLE Mood(
    id SERIAL PRIMARY KEY,
    value INT,
    date INT,
    patient INT,

    FOREIGN KEY(patient)
        REFERENCES Patient(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE
);

CREATE TABLE Hashtag(
    id SERIAL PRIMARY KEY ,
    name VARCHAR(64) NOT NULL
    
);

CREATE TABLE HashtagMood(
    hashtagId INT,
    moodId INT,

    FOREIGN KEY(hashtagId)
        REFERENCES Hashtag(id)
        ON UPDATE CASCADE,
    
    FOREIGN KEY(moodId)
        REFERENCES Mood(id)
        ON UPDATE CASCADE,
        
     PRIMARY KEY(hashtagId,moodId)
);

CREATE TABLE Weather(
    id SERIAL PRIMARY KEY,
    minTemperature INT NOT NULL,
    maxTemperature INT NOT NULL,
    city VARCHAR(64) NOT NULL,
    rain INT NOT NULL
);

CREATE TABLE Events(
    id SERIAL PRIMARY KEY,
    date INT NOT NULL,
    description VARCHAR(256) NOT NULL,
    location VARCHAR(128),
    summary VARCHAR(256) NOT NULL,
    patient INT NOT NULL,

    FOREIGN KEY(patient)
        REFERENCES Patient(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE
);

CREATE TABLE Category(
    id SERIAL PRIMARY KEY,
    name  VARCHAR(64) NOT NULL,
    color VARCHAR(64) NOT NULL
);

CREATE TABLE CategoryEvent(
    categoryId INT NOT NULL,
    eventId INT NOT NULL,

    FOREIGN KEY(categoryId)
        REFERENCES Category(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE,
        
    
    FOREIGN KEY(eventId)
        REFERENCES Events(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE,

    PRIMARY KEY(categoryId,eventId)

)