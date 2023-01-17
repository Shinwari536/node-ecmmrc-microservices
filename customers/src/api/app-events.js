const CustomerService = require('../services/customer-service');

module.exports = (app) => {
    const service = new CustomerService();

    app.use('/app-events', async (req, res) => {
        const payload = req.body;
        // console.log('payload: ', req.body);

        service.SubscribeEvents(payload);

        console.log("====================== Customer service received and event ======================");
        res.json(payload);
    })
}