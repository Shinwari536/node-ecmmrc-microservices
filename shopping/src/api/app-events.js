const ShoppingService = require('../services/shopping-service');

module.exports = (app) => {
    const service = new ShoppingService();

    app.use('/app-events', async (req, res) => {
        const payload = req.body;
        service.subscribeEvents(payload);

        console.log("====================== Shipping service received and event ======================");
        res.json(payload);
    })
}