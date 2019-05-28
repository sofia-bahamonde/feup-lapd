var pool = require('./database.js');

async function getMood(patient){

    let mood_query = "select mood.value, EXTRACT (YEAR FROM mood.moodDate) AS YEAR, EXTRACT (MONTH FROM mood.moodDate) AS MONTH, EXTRACT (DAY FROM mood.moodDate) AS DAY, mood.description " +
    "from mood inner join patient on  mood.patient = patient.id where mood.patient=" + patient;
    
    let result2 = await pool.query(mood_query);

    let mood = result2.rows;

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





module.exports ={
    getMood: getMood,
    getWeather: getWeather
}