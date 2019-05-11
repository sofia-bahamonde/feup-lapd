var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index',  {layout: 'index-layout.hbs'});
});

/* GET patients page. */
router.get('/patients', function(req, res) {
  res.render('patients');
});

/* GET patients page. */
router.get('/register', function(req, res) {
  res.render('register');
});



module.exports = router;
