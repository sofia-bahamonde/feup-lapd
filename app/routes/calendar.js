var express = require('express');
var router = express.Router();
var pool = require('../database.js');
const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
var user = 0;

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var categories = Object.freeze({"Sports":1, "Sleep":2, "Social":3, "Work":4,"Relax":5});



router.get('/update/:patientId', async(req, res) =>{
    const clientId = req.params.patientId
    let query =`SELECT apiKey FROM Patient WHERE id=${clientId}`
    let promises = []
      user= clientId
      try{
        result = await pool.query(query)
    let credentials =JSON.parse(result.rows[0].apikey)
    // console.log(result.rows[0].apikey)
    promises.push(authorize(credentials,'Sports',false, listEvents))
    promises.push(authorize(credentials,'Sleep',false, listEvents))
    promises.push(authorize(credentials,'Social',false, listEvents))
    promises.push(authorize(credentials,'Work',false, listEvents))
    promises.push(authorize(credentials,'Relax',true, listEvents))

    await Promise.all(promises)
 
    }
    catch(err){
        console.log(err)
    }

   // res.render('index');
});


router.get('/:patient/show', async(req, res) => {

  try{

    let calendarEvents  = await getEventsPatient(req.params.patient,1558310400, 1577836800);

    calendarEvents = JSON.stringify(calendarEvents);

    res.render('calendar', {calendarEvents});

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
 
  
  for(let i= 0; i<result.rows.length; i++){
    result.rows[i].start = new Date(result.rows[i].start*1000).toJSON();
    result.rows[i].end = new Date(result.rows[i].end*1000).toJSON();
  }
  return result.rows;
  
}



  

function authorize(credentials,calendarId,lastCall, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    fs.readFile("token"+user+".json", (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client,calendarId,lastCall);
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
   listEvents = async(auth, calendarName,lastCall)=>{
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
           // console.log("Calendar:"+calendarId+ " Date:"+ Date.parse(events[i].start.dateTime)/1000 +" LastUpdate:"+result.rows[0].lastupdate)
            if(Date.parse(events[i].start.dateTime)/1000 >result.rows[0].lastupdate){
              await insertEvent(events[i],categories[calendarName])
              if(biggestDate< (Date.parse(events[i].start.dateTime)/1000)){
                biggestDate =Date.parse(events[i].start.dateTime)/1000;
              }
            }
              
          }
          if(lastCall){
            query = `UPDATE Patient SET lastUpdate=${biggestDate} WHERE id=${user}`
            await pool.query(query)
               
          }
      
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