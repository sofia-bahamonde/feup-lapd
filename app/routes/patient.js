var express = require('express');
var router = express.Router();
var pool = require('../database.js');

let months ={
    janeiro: "01",
    fevereiro: "02",
    março: "03",
    abril: "04",
    maio: "05",
    junho: "06",
    julho: "07",
    agosto: "08",
    setembro: "09",
    outubro: "10",
    novembro: "11",
    dezembro: "12"

}

/* register patient page */
router.get('/register/form', function(req, res) {
    res.render('patient/register_patient');
  });


/* creates a new patient in the databse */
router.post('/register', function(req, res) {
    let name = req.body.name;
    let key = req.body.key;
    let city = req.body.city;
    let job = req.body.job;
    let birthday = req.body.birthdate;

    let text= 'insert into patient(name,apikey,birthdayDate,city,job) values($1,$2,$3,$4,$5)';
    let values = [name, key, birthday, city, job];

    
    pool.query(text, values, (error, result) => {
        if (error) {
            throw error;
        }

        res.render('index');
    })
});

/* list all patients page*/
router.get('/list', function(req, res) {

    pool.query('select * from patient', (error, result) => {
        if (error) {
            throw error;
        }
        console.log(result.rows);
        let users = result.rows;
        res.render('patient/list_patients', {users});
    })
    
  });


router.get('/:patient/addMood/form', function(req, res) {
   let patient = req.params.patient;
   res.render('patient/add_mood', {patient});
    
  });

router.post('/:patient/addMood', function(req, res) {
   
    let iMoodJSON = JSON.parse(req.body.json);
    let levels = [];
    let dates =[];

    for(let i =0; i < iMoodJSON.length; i++ ){
        levels.push(iMoodJSON[i].Level);

        let dateArray = (iMoodJSON[i].Date).split(' ');
        let date = dateArray[4] + "-" + months[dateArray[2]] + "-" + dateArray[0];
        dates.push(date);

    }

    let patient = req.params.patient;
    let query= 'insert into mood(value,moodDate,patient) values';

    for(let i=0; i < iMoodJSON.length; i++){
        query += "(" + levels[i] + ", to_date(\'" + dates[i] + "\', \'YYYY-MM-DD\')" + ", " + patient + '),';
    };

    query = query.substring(0, query.length -1);

    console.log(query);

    pool.query(query, (error, result) => {
        if (error) {
            throw error;
        }
        console.log(result);
        res.render('index');
     })
     
   });


module.exports = router;
