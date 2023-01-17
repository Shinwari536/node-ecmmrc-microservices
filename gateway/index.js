const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(express.json());

app.use('/customer', proxy('http://localhost:9001'));
app.use('/shopping', proxy('http://localhost:9003'));
app.use('/', proxy('http://localhost:9002')); // 



app.listen(9000, () => {
    console.log('App is listening at PORT 9000...');
});