const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');

const AreaModel = require('./models/AreaModel');
const indexRouter = require('./routes/index');

const app = express();

app.set('config', config);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const pathStorage = path.join(__dirname, 'storage');
const pathAnalyser = path.join(__dirname, 'analyser/analyse.py');

const areaModel = new AreaModel({ connection: 'amqp://admin:admin@195.242.6.140' });
areaModel.connect().catch((error) => {
  console.error(`Connection failed: ${error.message}`);
});

app.use((req, res, next) => {
  req.pathStorage = pathStorage;
  req.pathAnalyser = pathAnalyser;
  req.models = { areaModel };
  next();
});

app.use('/', indexRouter);

module.exports = app;
