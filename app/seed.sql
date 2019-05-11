DROP DATABASE IF EXISTS lapd;

CREATE DATABASE lapd;
USE lapd;
SET foreign_key_checks = 1;

CREATE TABLE Patient(
    id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(128) NOT NULL,
     apiKey VARCHAR(256) NOT NULL,
     birthdayDate INT,
     city VARCHAR(64) NOT NULL,
);

CREATE TABLE Therapist(
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    id INT PRIMARY KEY AUTO_INCREMENT,
    value INT,
    date INT,
    patient INT,

    FOREIGN KEY(patient)
        REFERENCES Patient(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE,
);

CREATE TABLE Hashtag(
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    id INT PRIMARY KEY AUTO_INCREMENT,
    minTemperature INT NOT NULL,
    maxTemperature INT NOT NULL,
    city VARCHAR(64) NOT NULL,
    rain INT NOT NULL
);

CREATE TABLE Events(
    id INT PRIMARY KEY AUTO_INCREMENT,
    date INT NOT NULL,
    description VARCHAR(256) NOT NULL,
    location VARCHAR(128),
    summary VARCHAR(256) NOT NULL,
    patient INT NOT NULL,

    FOREIGN KEY(patient)
        REFERENCES Patient(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE,
);

CREATE TABLE Category(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name  VARCHAR(64) NOT NULL,
    colorVARCHAR(64) NOT NULL
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