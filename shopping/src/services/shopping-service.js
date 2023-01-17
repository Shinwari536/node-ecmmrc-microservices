const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ShoppingService {

    constructor() {
        this.repository = new ShoppingRepository();
    }

    async getCart(_id) {
        try {
            const cartItems = await this.repository.cart(_id);
            return FormateData(cartItems);
        } catch (error) {
            throw error;
        }
    }

    async placeOrder(userInput) {
        const { _id, txnNumber } = userInput
        // Verify the txn number with payment logs
        try {
            const orderResult = await this.repository.createNewOrder(_id, txnNumber);
            return FormateData(orderResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }

    }

    async getOrders(customerId) {
        try {
            const orders = await this.repository.orders(customerId);
            return FormateData(orders);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async getOrderDetails(orderId) {
        try {
            const orderDetails = await this.repository.orderDetails(orderId);
            return FormateData(orderDetails);
        } catch (error) {
            throw error
        }
    }

    async manageCart(customerId, item, qty, isRemove) {
        try {
            const cartResult = await this.repository.addCartItem(customerId, item, qty, isRemove);
            return FormateData(cartResult);
        } catch (error) {
            throw error;
        }
    }


    async SubscribeEvents(payload) {
        console.log(payload);

        const { event, data } = payload;

        const { userId, product, qty } = data;

        switch (event) {
            case 'ADD_TO_CART':
                this.ManageCart(userId, product, qty, false);
                break;
            case 'REMOVE_FROM_CART':
                this.ManageCart(userId, product, qty, true);
                break;
            default:
                break;
        }

    }

    async getProductPayload(userId, order, event) {
        // console.log("Product: ", product);

        if (order) {
            const payload = {
                event: event,
                data: {
                    userId,
                    product: { _id: order._id, name: order.name, dec: order.desc, banner: order.banner, available: order.available, price: order.price },
                }
            }
            return FormateData(payload);
        } else {
            console.log("I am here- failed");

            return FormateData(new Error("No product found."));
        }
    }

}

module.exports = ShoppingService;