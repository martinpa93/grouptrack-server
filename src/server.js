var express = require("express");
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var config = require('./config/config');
var app = express();


app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }))
app.use(bodyParser.json({ limit: '10mb'}));
app.use(passport.initialize());
var passportMiddleware = require('./middleware/passport.js');
passport.use(passportMiddleware);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var routes = require('./routes.js');
app.use('/api', routes);

mongoose.connect(config.db, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', ()=> {
  console.log('Connected to Mongo DB');
});

app.listen(5000, () => {
  console.log('CORS-enabled web server listening on port 5000');
});

