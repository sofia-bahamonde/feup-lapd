var express = require('express');
var router = express.Router();

let url    = 'http://api.openweathermap.org/data/2.5/weather?q='
let appId  = 'appid=eb0ee711a1bef9907ac2aa0d6f223400';
let units  = '&units=metric'; 
var request = require('request');



router.get('/weather', function(req, res, next){
  let city = req.body.city;
  url = url+'Porto'+"&"+appId;
  console.log(url);
 request(url, function (error, response, body) {
      body = JSON.parse(body);
      if(error && response.statusCode != 200){
        throw error;
      }
    console.log(body);
   });
});

router.get('/calendar1', function(req, res) {
  res.render('calendar1');
});


module.exports = router;
