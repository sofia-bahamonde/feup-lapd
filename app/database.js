const Pool = require('pg').Pool


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lapd',
  password: 'postgres',
  port: 5433,
})

module.exports = pool;