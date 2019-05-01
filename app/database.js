const Pool = require('pg').Pool


const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres'
})

module.exports = pool;