const { ShoppingRepository } = require("../database");
const { formateObjectData, formateArrayData } = require("../utils");
const { APIError } = require('../utils/app-errors')

// All Business logic will be here
class ShoppingService {

    constructor() {
        this.repository = new ShoppingRepository();
    }

    async getCart(_id) {
        try {
            const cartItems = await this.repository.cart(_id);
            return formateArrayData(cartItems);
            
        } catch (error) {
            throw error;
        }
    }

    async placeOrder(userInput) {
        const { _id, txnNumber } = userInput
        // Verify the txn number with payment logs
        try {
            const orderResult = await this.repository.createNewOrder(_id, txnNumber);
            return formateObjectData(orderResult);
        } catch (err) {
            throw err;
        }

    }

    async getOrders(customerId) {
        try {
            const orders = await this.repository.orders(customerId);
            return formateArrayData(orders);
        } catch (err) {
            throw err;
        }
    }

    async getOrderDetails(orderId) {
        try {
            const orderDetails = await this.repository.orderDetails(orderId);
            return formateObjectData(orderDetails);
        } catch (error) {
            throw error
        }
    }

    async manageCart(customerId, item, qty, isRemove) {
        try {
            const cartResult = await this.repository.addCartItem(customerId, item, qty, isRemove);
            return formateObjectData(cartResult);
        } catch (error) {
            throw error;
        }
    }


    async subscribeEvents(payload) {
        // console.log(payload);

        const { event, data } = payload;

        const { userId, product, qty } = data;

        switch (event) {
            case 'ADD_TO_CART':
                this.manageCart(userId, product, qty, false);
                break;
            case 'REMOVE_FROM_CART':
                this.manageCart(userId, product, qty, true);
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
                    items: { _id: order._id, name: order.name, banner: order.banner, price: order.price },
                }
            }
            return formateObjectData(payload);
        } else {
            console.log("I am here- failed");

            return formateObjectData(new Error("No product found."));
        }
    }

}

module.exports = ShoppingService;