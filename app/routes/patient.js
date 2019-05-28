var express = require('express');
var router = express.Router();
var pool = require('../database.js');
const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
var request = require('request');
var user = 0;
var categories = Object.freeze({"Sports":1, "Sleep":2, "Social":3, "Work":4,"Relax":5});

var utils = require('../utils.js');


let url = 'http://api.openweathermap.org/data/2.5/weather?q='
let appId = 'appid=eb0ee711a1bef9907ac2aa0d6f223400';

var coordenates = Object.freeze({"Lisboa": "38.744098,-9.158084", 
                                "Porto":"41.162147,-8.621652" , 
                                "Coimbra":"40.225587,-8.452290" , 
                                "Aveiro":"40.628093,-8.643259"});


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.



/* register patient page */
router.get('/register/form', function(req, res) {
    res.render('patient/register_patient');
  });

router.get('/activities', async(req, res) =>{
  if(!req.body)
    res.status(400)
  try{
  const query = `SELECT Category.name, SUM((Events.finalDate -Events.initialDate)) AS duration FROM Events JOIN CategoryEvent ON CategoryEvent.eventId = Events.id JOIN Category ON CategoryEvent.categoryId = Category.id WHERE Events.patient=${req.body.patientId} AND Events.initialDate > ${req.body.date1} AND Events.finalDate < ${req.body.date2}GROUP BY Category.name;`
  let response = await pool.query(query)
  res.status(200)
  res.send(response.rows)
  }
  catch(err){
    res.status(400)
    res.send(err.msg)
  }
});


router.get('/events',async(req,res) =>{
  if(!req.body)
  res.status(400)
});


// const insertWeather = async(city) => {

//     url = url+city+"&"+appId;
    
//     request(url, async (error, response, body) => {
//         body = JSON.parse(body);
//         if(error && response.statusCode != 200){
//           throw error;
//         }

//         console.log(body);

//         var minTemperature = parseInt(body.main.temp_min);
//         var maxTemperature = parseInt(body.main.temp_max);
//         var rain = body.main.humidity;
//         var dateTime = new Date();
//         var dateWeather = dateTime.toISOString().slice(0,10);


//         let query= 'insert into weather(minTemperature,maxTemperature,city,rain,dateWeather) values($1,$2,$3,$4,$5)';
//         let values = [minTemperature, maxTemperature, city, rain, dateWeather];

//         result = await pool.query(query, values);

//      });
// }

const insertWeatherDark = async(city) => {

    urlAPI = 'https://api.darksky.net/forecast/468542072566d71440910f782d9f5130/' + coordenates[city];
    
    request(urlAPI, async (error, response, body) => {
        body = JSON.parse(body);
        if(error && response.statusCode != 200){
          throw error;
        }

        console.log(body);

        var minTemperature = parseInt(body.currently.temperature);
        var maxTemperature = parseInt(body.currently.temperature);
        var rain = parseInt(body.currently.humidity);
        var dateTime = new Date();
        var dateWeather = dateTime.toISOString().slice(0,10);


        let query= 'insert into weather(minTemperature,maxTemperature,city,rain,dateWeather) values($1,$2,$3,$4,$5)';
        let values = [minTemperature, maxTemperature, city, rain, dateWeather];

        result = await pool.query(query, values);

     });
}




const updateWeather = async ()=> {

    response = await pool.query('select distinct city from patient', (error, result) => {
        if (error) {
            throw error;
        }

        cities = result.rows;

        for(let i = 0; i < cities.length; i++){
            console.log(cities[i].city);

            try{            
                  insertWeatherDark(cities[i].city);               
            }
            catch(err){
                console.log(err);
            }  
        }
    })
}



/* creates a new patient in the databse */
router.post('/register', async (req, res) => {
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
router.get('/list', async(req, res) =>{
    console.log("fsfdf");

    pool.query('select * from patient', (error, result) => {
        if (error) {
            throw error;
        }
        res.json({ success: true, users:result.rows  });
    })
    
  });

router.get('/:patient/calendar', async(req, res) => {
 
  try{

    let calendarEvents  = await getEventsPatient(req.params.patient,1558310400, 1559347200);

    calendarEvents = JSON.stringify(calendarEvents);

    res.render('calendar', {calendarEvents});

  }
  catch(err){
    console.log(err)
  }

});



router.get('/:patient/dashboard', async(req, res) => {
    try{
        let name_query = `SELECT name FROM patient WHERE patient.id=` + req.params.patient;
     
        let result1 = await pool.query(name_query);
        let name = result1.rows[0].name;

        let mood = await utils.getMood(req.params.patient);
  
        res.render('dashboard/mood', {mood, name });

        
        }
        catch(err){
          console.log(err)
        }
});
   

  

const getEventsPatient = async(patientId,date1, date2) =>{
  const query = `SELECT Events.summary as title, Events.initialDate as start, Events.finalDate as end, Category.color FROM
  Events JOIN CategoryEvent ON Events.id = categoryEvent.eventId JOIN Category ON Category.id = categoryEvent.categoryId Where Events.patient=${patientId} AND
  Events.initialDate > ${date1} AND Events.finalDate < ${date2};`
  let result = await pool.query(query)
  console.log(result.rows)
  
  for(let i= 0; i<result.rows.length; i++){
    result.rows[i].start = new Date(result.rows[i].start*1000).toJSON();
    result.rows[i].end = new Date(result.rows[i].end*1000).toJSON();
  }
  return result.rows;
  
}


module.exports = router;
