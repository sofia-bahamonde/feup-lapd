var pool = require('./database.js');

getMood = async (patient) => {

    let query = "select mood.value, EXTRACT (YEAR FROM mood.moodDate) AS YEAR, EXTRACT (MONTH FROM mood.moodDate) AS MONTH, EXTRACT (DAY FROM mood.moodDate) AS DAY, mood.description " +
    "from mood inner join patient on  mood.patient = patient.id where mood.patient=" + patient;
   
    let result = await pool.query(query);
  
    let mood = result.rows;
  
    for(let i =0; i <mood.length; i++){
      mood[i].date = mood[i].day + "/" + mood[i].month + "/" + mood[i].year;
    }
  
    mood = JSON.stringify(mood);
  
    return mood;
  }

getActivities = async (patient) => {
    const query = `SELECT Category.name, SUM((Events.finalDate -Events.initialDate)) AS duration FROM Events JOIN CategoryEvent ON CategoryEvent.eventId = Events.id JOIN Category ON CategoryEvent.categoryId = Category.id WHERE Events.patient=${patient} GROUP BY Category.name;`
    let response = await pool.query(query);

    console.log(response.rows);

    return response.rows;
}



module.exports ={
    getMood: getMood,
    getActivities: getActivities
}