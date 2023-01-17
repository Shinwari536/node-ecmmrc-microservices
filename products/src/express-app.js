const express = require('express');
const cors  = require('cors');
const morgan = require('morgan');
const { products } = require('./api');
const HandleErrors = require('./utils/error-handler')


module.exports = async (app) => {

    app.use(express.json({ limit: '1mb'}));
    app.use(express.urlencoded({ extended: true, limit: '1mb'}));
    app.use(cors());
    app.use(morgan('tiny'));
    app.use(express.static(__dirname + '/public'))

    //api
    products(app);

    // error handling
    app.use(HandleErrors);
    
}