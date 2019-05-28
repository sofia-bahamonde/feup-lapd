var express = require('express');
var router = express.Router();
var pool = require('../database.js');
const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
var request = require('request');
var user = 0;
var categories = Object.freeze({"Sports":1, "Sleep":2, "Social":3, "Work":4,"Relax":5})

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


router.get('/update/:patientId', async(req, res) =>{
    const clientId = req.params.patientId
    let query =`SELECT apiKey FROM Patient WHERE id=${clientId}`
    let promises = []
      user= clientId
      try{
        result = await pool.query(query)
    let credentials =JSON.parse(result.rows[0].apikey)
    // console.log(result.rows[0].apikey)
    promises.push(authorize(credentials,'Sports', listEvents))
    promises.push(authorize(credentials,'Sleep', listEvents))
    promises.push(authorize(credentials,'Social', listEvents))
    promises.push(authorize(credentials,'Work', listEvents))
    promises.push(authorize(credentials,'Relax', listEvents))

    await Promise.all(promises)
    
    }
    catch(err){
        console.log(err)
    }
    

res.render('index')
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
    let descriptions =[];

    for(let i =0; i < iMoodJSON.length; i++ ){
        levels.push(iMoodJSON[i].Level);
        descriptions.push(iMoodJSON[i].Comment);

        let dateArray = (iMoodJSON[i].Date).split(' ');
        let date = dateArray[4] + "-" + months[dateArray[2]] + "-" + dateArray[0];
        dates.push(date);

    }

    let patient = req.params.patient;
    let query= 'insert into mood(value,moodDate,patient,description) values';

    for(let i=0; i < iMoodJSON.length; i++){
        query += "(" + levels[i] + ", to_date(\'" + dates[i] + "\', \'YYYY-MM-DD\')" + ", " + patient + ", \'" + descriptions[i].toString() +"\'),";
    };

    query = query.substring(0, query.length -1);
    pool.query(query, (error, result) => {
        if (error) {
            throw error;
        }
        res.render('index');
     })
     
});


router.get('/:patient/calendar', async(req, res) => {


  
  try{


    var calendarEvents = [  // change to array of events
      {
      title: 'Event1',
      start: ' 2019-05-30T09:30:00',
      color:'black'
    },
    {
      title: 'Event2',
      start: '2019-05-31'
    }];


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

        let mood_query = "select mood.value, EXTRACT (YEAR FROM mood.moodDate) AS YEAR, EXTRACT (MONTH FROM mood.moodDate) AS MONTH, EXTRACT (DAY FROM mood.moodDate) AS DAY, mood.description " +
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
   

   function authorize(credentials,calendarId, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    fs.readFile("token"+user+".json", (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client,calendarId);
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile("token"+user+".json", JSON.stringify(token), (err) => {
          if (err) return console.error(err);
        });
        callback(oAuth2Client);
      });
    });
  }
  
  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
   listEvents = async(auth, calendarName)=>{
    const calendar = google.calendar({version: 'v3', auth});
    let calendarId = calendarName
   

   try{
    calendar.calendarList.list({
      auth: auth,
      maxResults: 100
    },
    async (err, result) =>{
      for(let i=0; i < result.data.items.length;i++){
        if(result.data.items[i].summary==calendarName){
          calendarId=result.data.items[i].id;
        }
      }
      calendar.events.list({
        calendarId: calendarId,
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, async(err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
          
          let query = `SELECT lastUpdate FROM Patient WHERE id=${user}`
          let result = await pool.query(query)
          let biggestDate = result.rows[0].lastupdate;
          for(let i=0; i< events.length;i++){
            if(Date.parse(events[i].start.dateTime)>result.rows[0].lastupdate)
              await insertEvent(events[i],categories[calendarName])
              console.log(events[i].start.dateTime)
              if(biggestDate< (Date.parse(events[i].start.dateTime)/1000)){
               // console.log(events[i].start.dateTime)
                biggestDate =Date.parse(events[i].start.dateTime)/1000;
              }
          }

          query = `UPDATE Patient SET lastUpdate=${biggestDate} WHERE id=${user}`
          result = await pool.query(query)
          
        } else {
          console.log('No upcoming events found.');
        }
      });
    }
  );
   }
   catch(err){
     console.log(err)
    
   }
}

const insertEvent = async(event,categoryName) => {
  try{
  const query1 = `INSERT INTO Events(initialDate,finalDate,description,location,summary,patient)VALUES($1,$2,$3,$4,$5,$6) RETURNING id`
  let values =[Date.parse(event.start.dateTime)/1000,Date.parse(event.end.dateTime)/1000,event.description,event.location,event.summary,user]
  let result = await pool.query(query1,values)
  const query2 = `INSERT INTO CategoryEvent(categoryId,eventId)VALUES($1,$2)`
  values=[categoryName,result.rows[0].id]
  result= await pool.query(query2,values)
  }
  catch(err){
    console.log(err)
  }
}



module.exports = router;
