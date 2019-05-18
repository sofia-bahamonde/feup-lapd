var express = require('express');
var router = express.Router();
var pool = require('../database.js');

/* GET patients page. */
router.get('/register', function(req, res) {
    res.render('register_patient');
  });


/* Register new patient */
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



module.exports = router;
