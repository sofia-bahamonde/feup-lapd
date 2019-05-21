var express = require('express');
var router = express.Router();
var pool = require('../database.js');

/* register patient page */
router.get('/register', function(req, res) {
    res.render('register_patient');
  });


/* creates a new patient in the databse */
router.post('/create', function(req, res) {
    console.log(req.body);
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
        console.log(result.rows)
        res.render('patients');
    })
    
  });



module.exports = router;
