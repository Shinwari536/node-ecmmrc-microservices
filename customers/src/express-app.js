const express = require('express');
const cors  = require('cors');
const morgan = require('morgan');
const { customer, appEvents } = require('./api');
const HandleErrors = require('./utils/error-handler')


module.exports = async (app) => {

    app.use(express.json({ limit: '1mb'}));
    app.use(express.urlencoded({ extended: true, limit: '1mb'}));
    app.use(cors());
    app.use(morgan('tiny'));
    app.use(express.static(__dirname + '/public'))

    // Listen to App event
    appEvents(app);
    //api
    customer(app);
    // products(app);
    // shopping(app);

    // error handling
    app.use(HandleErrors);
    
}