var express = require('express');
var router = express.Router();
var pool = require('../database.js');

let url    = 'http://api.openweathermap.org/data/2.5/weather?q='
let appId  = 'appid=eb0ee711a1bef9907ac2aa0d6f223400';
let units  = '&units=metric'; 
var request = require('request');

router.get("/",  function(req, res) {
  res.render('dashboard');
});


/* GET patients page. */
router.get('/register', function(req, res) {
  res.render('register');
});


router.get('/weather', function(req, res, next){
  let city = req.body.city;
  url = 'https://api.darksky.net/forecast/468542072566d71440910f782d9f5130/38.744098,-9.158084';
  console.log(url);
 request(url, function (error, response, body) {
      body = JSON.parse(body);
      if(error && response.statusCode != 200){
        throw error;
      }
    console.log(body);

   });
});

router.get('/calendar', function(req, res) {
  res.render('calendar');
});


module.exports = router;
