const express = require('express');
const morgan = require('morgan')
const cors  = require('cors');
const { shopping, appEvents } = require('./api');
const HandleErrors = require('./utils/error-handler')


module.exports = async (app) => {

    app.use(express.json({ limit: '1mb'}));
    app.use(express.urlencoded({ extended: true, limit: '1mb'}));
    app.use(cors());
    app.use(morgan('tiny'));
    app.use(express.static(__dirname + '/public'))

    // Listening to app events
    appEvents(app);

    //api
    shopping(app);

    // error handling
    app.use(HandleErrors);
    
}