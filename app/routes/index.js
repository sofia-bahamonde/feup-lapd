var express = require('express');
var router = express.Router();
var pool = require('../database.js');

/* GET home page. */
router.get('/', function(req, res) {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }

    res.render('index',  {'user': results.rows[0]});
  })



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
