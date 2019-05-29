var pool = require('./database.js');

getMood = async (patient) => {

    let query = "select mood.value, EXTRACT (YEAR FROM mood.moodDate) AS YEAR, EXTRACT (MONTH FROM mood.moodDate) AS MONTH, EXTRACT (DAY FROM mood.moodDate) AS DAY, mood.description " +
    "from mood inner join patient on  mood.patient = patient.id where mood.patient=" + patient;
<<<<<<< HEAD
   
    let result = await pool.query(query);
  
    let mood = result.rows;
  
=======
    
    let result2 = await pool.query(mood_query);

    let mood = result2.rows;

>>>>>>> 8fec142f979bff2ad80eb9834b63a8b530e028f9
    for(let i =0; i <mood.length; i++){
      mood[i].date = mood[i].day + "/" + mood[i].month + "/" + mood[i].year;
    }

    mood = JSON.stringify(mood);

    return mood;
}


async function getWeather(patient){

    let weather_query = "select weather.rain, weather.dateweather from weather, patient where patient.id=1 and weather.city = patient.city order by dateweather desc limit 3;";

    let result2 = await pool.query(weather_query);

    let weather = result2.rows;

    return weather;
}



getActivities = async (patient) => {
    const query = `SELECT Category.name, SUM((Events.finalDate -Events.initialDate)) AS duration FROM Events JOIN CategoryEvent ON CategoryEvent.eventId = Events.id JOIN Category ON CategoryEvent.categoryId = Category.id WHERE Events.patient=${patient} GROUP BY Category.name;`
    let response = await pool.query(query);

    console.log(response.rows);

    return response.rows;
}



module.exports ={
    getMood: getMood,
<<<<<<< HEAD
    getActivities: getActivities
=======
    getWeather: getWeather
>>>>>>> 8fec142f979bff2ad80eb9834b63a8b530e028f9
}