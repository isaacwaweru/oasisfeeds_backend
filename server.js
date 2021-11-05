const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
var PORT = process.env.PORT | 4000;
require('dotenv').config();
const schedule = require('node-schedule');

// create express app
const app = express();
app.use(cors());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Configuring the database
const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

// parse requests of content-type - application/json
app.use(bodyParser.json());

// define a system route
app.get("/", (req, res) => {
  res.json({
    message: "Server sucess!",
    creator: "Isaac Waweru",
    year: "2021",
    for: "OasisFeeds",
  });
});

//routes
require("./app/routes/routes.js")(app);

//Test scheduler

// const job = schedule.scheduleJob("*/1 * * * *", function(){
//   console.log('The world is going to end today.');
// });

// listen for requests
app.listen(PORT, () => {
  console.log("Server is listening on port ", PORT);
});