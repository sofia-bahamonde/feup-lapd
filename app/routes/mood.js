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


router.post('/:patient/update', function(req, res) {
    let iMoodJSON = req.body;
    let levels = [];
    let dates =[];
    let descriptions =[];

    console.log(req.body);

try{

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
     })

    }
    catch(err){
        console.log(err)
      }
     
});

module.exports = router;
