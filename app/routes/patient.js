var express = require('express');
var router = express.Router();
var pool = require('../database.js');
var request = require('request');
var utils = require('../utils.js');

var coordenates = Object.freeze({"Lisboa": "38.744098,-9.158084", 
                                "Porto":"41.162147,-8.621652" , 
                                "Coimbra":"40.225587,-8.452290" , 
                                "Aveiro":"40.628093,-8.643259"});


/* register patient page */
router.get('/register/form', function(req, res) {
    res.render('patient/register_patient');
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

router.get('/:patient/dashboard', async(req, res) => {
    try{
        let patient = req.params.patient;
        let name_query = `SELECT name FROM patient WHERE patient.id=` + patient;
     
        let result = await pool.query(name_query);
        let name = result.rows[0].name;

        let mood = await utils.getMood(patient);
        let activities = await utils.getActivities(patient);
        let activities_str = JSON.stringify(activities);
       
  
        res.render('dashboard', {mood, name, activities, activities_str, patient});

        
        }
        catch(err){
          console.log(err)
        }
});
   


module.exports = router;
