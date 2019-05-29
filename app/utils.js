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


async function getWeather(patient){

    let weather_query = "select weather.rain, weather.dateweather from weather, patient where patient.id=1 and weather.city = patient.city order by dateweather desc limit 3;";

    let result2 = await pool.query(weather_query);

    let weather = result2.rows;

    return weather;
}



getActivities = async (patient) => {
    let query = `SELECT Category.name, SUM((Events.finalDate -Events.initialDate)) AS duration FROM Events JOIN CategoryEvent ON CategoryEvent.eventId = Events.id JOIN Category ON CategoryEvent.categoryId = Category.id WHERE Events.patient=${patient} GROUP BY Category.name;`
    let response = await pool.query(query);

    let activities = response.rows;
    let total =0;

    color = ['#4e73df', '#1cc88a', '#5a5c69',  '#36b9cc' ,'#e74a3b', '#858796' ];

    for(let i =0; i < activities.length; i++){
      activities[i].color = color[i];  
      total += parseInt(activities[i].duration);  
    }

    for(let i =0; i < activities.length; i++){
      activities[i].duration =  Math.round(activities[i].duration * 100 / total);    
    }

    return activities;
}


module.exports ={
    getMood: getMood,
    getActivities: getActivities,
    getWeather: getWeather
}