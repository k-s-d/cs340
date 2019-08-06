var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_davisk8',
  password        : '5064',
  database        : 'cs340_davisk8'
});
module.exports.pool = pool;
