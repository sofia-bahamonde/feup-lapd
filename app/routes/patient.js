var express = require('express');
var router = express.Router();
var pool = require('../database.js');
const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
var request = require('request');
var user = 0;
var categories = Object.freeze({"Sports":1, "Sleep":2, "Social":3, "Work":4,"Relax":5})

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


  router.get('/update/:patientId', async(req, res) =>{
    const clientId = req.params.patientId
    let query =`SELECT apiKey FROM Patient WHERE id=${clientId}`
    let promises = []

    // result = await pool.query(query)
    // pool.query(query, async(error, result) => {
    //   if (error) {
    //     console.log(error)
    //       throw error
    //   }
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
       // console.log(result.data.items[i].summary);
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
          console.log(query)
          
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
