const ShoppingService = require("../services/shopping-service");
const PublishCustomerEvent = require('../utils');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {

    const service = new ShoppingService();

    app.post('/order', UserAuth, async (req, res, next) => {

        const { _id } = req.user;
        const { txnNumber } = req.body;


        try {
            const { data } = await service.placeOrder({ _id, txnNumber });
            console.log("Data: api: ", data);
            const payload = await service.getProductPayload(_id, data.items, "CREATE_ORDER");
            PublishCustomerEvent(payload);
            return res.json(data);

        } catch (err) {
            next(err)
        }

    });

    app.get('/orders', UserAuth, async (req, res, next) => {

        const { _id } = req.user;

        try {
            const { data } = await service.getOrders(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }

    });


    app.get('/cart', UserAuth, async (req, res, next) => {

        const { _id } = req.user;
        try {
            const { data } = await service.getCart(_id);
            return res.status(200).json(data);
        } catch (err) {
            // next(err);
            console.log("error:", err);
            return res.json(err);

        }
    });


}