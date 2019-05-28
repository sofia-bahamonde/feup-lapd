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

/* manage patients page*/
router.get('/manage', function(req, res) {

    pool.query('select * from patient', (error, result) => {
        if (error) {
            throw error;
        }
        let users = result.rows;
        res.render('patient/list_patients', {users});
    })
    
  });

/* returns patients */
router.get('/list', function(req, res) {
    console.log("fsfdf");

    pool.query('select * from patient', (error, result) => {
        if (error) {
            throw error;
        }
        res.json({ success: true, users:result.rows  });
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

    pool.query(query, (error, result) => {
        if (error) {
            throw error;
        }
        res.render('index');
     })
     
});

router.get('/:patient/dashboard', async(req, res) => {
    try{
        let name_query = `SELECT name FROM patient WHERE patient.id=` + req.params.patient;
     
        let result1 = await pool.query(name_query);
        let name = result1.rows[0].name;

        let mood_query = "select mood.value, EXTRACT (YEAR FROM mood.moodDate) AS YEAR, EXTRACT (MONTH FROM mood.moodDate) AS MONTH, EXTRACT (DAY FROM mood.moodDate) AS DAY " +
        "from mood inner join patient on  mood.patient = patient.id where mood.patient=" + req.params.patient;
       
        let result2 = await pool.query(mood_query);

        let mood = result2.rows;
  
        for(let i =0; i <mood.length; i++){
          mood[i].date = mood[i].day + "/" + mood[i].month + "/" + mood[i].year;
        }
    
        mood = JSON.stringify(mood);
  
        res.render('dashboard/mood', {mood, name });

        
        }
        catch(err){
          console.log(err)
        }
});
   

module.exports = router;
