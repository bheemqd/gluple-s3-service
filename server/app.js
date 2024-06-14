// Requiring module
const express = require('express');
const mysql = require('mysql');
const Aws = require("aws-sdk");
 
// Creating express object
const app = express();
require('dotenv').config()

let dbOptionsDev = {
    host: "13.234.249.50",
    user: "hrqpro_it",
    password: "0O9WMn@1V(=m",
    database: "hrqpro_hronboard",
};

const pool = mysql.createPool(dbOptionsDev);
pool.getConnection(function (error) {
    if (error) {
      console.error("Unable to connect to the database, Error: %O", error)
      process.exit(1);
    }
    console.log("Successfully connected to Glueple MySql Database");
  });
module.exports = pool;
 
// Handling GET request
app.get('/', (req, res) => { 
    res.send('A simple Node App is '
        + 'running on this server') 
    res.end() 
}) 

// Port Number
const PORT = process.env.PORT || 5000;
 
// Server Setup
app.listen(PORT,console.log(
  `Server started on port ${PORT}`));

// import module
require('./routes')(app)

// wait 
exports.wait = async (newDb,query) => {
  return new Promise((resolve, reject) => {
    newDb.query(query, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  }
)}