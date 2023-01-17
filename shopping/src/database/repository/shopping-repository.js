const { OrderModel, CartModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError } = require('../../utils/app-errors')


//Dealing with data base operations
class ShoppingRepository {

    // payment

    async orders(customerId) {
        try {
            const orders = await OrderModel.find({ customerId });
            if(orders) return orders;
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Order of given orderId')
        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }

    async orderDetails(orderId) {
        try {
            const order = await OrderModel.findOne({ orderId: orderId });
            if(order) return order;
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Order of given orderId')
        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }

    async cart(customerId) {
        try {
            const cartItems = await CartModel.find({
                customerId
            });
            if (cartItems) {
                return cartItems;
            }
            throw new Error("Cart Items not found.")
        } catch (error) {
            throw error;
        }
    }

    async addCartItem(customerId, item, qty, isRemove) {

        try {
            const cart = await CartModel.findOne({ customerId: customerId });
            const { _id } = item;
            if (cart) {
                let isExist = false;
                let cartItems = cart.items;

                if (cartItems.length > 0) {

                    cartItems.map(item => {
                        if (item.product._id.toString() === _id.toString()) {
                            if (isRemove) {
                                cartItems.splice(cartItems.indexOf(item), 1);
                            } else {
                                item.unit = qty;
                            }
                            isExist = true;
                        }
                    });

                }

                if (!isExist && !isRemove) {
                    cartItems.push({ product: { ...item }, unit: qty });
                }
                cart.items = cartItems;
                return await cart.save();
            } else {
                return await CartModel.create({
                    customerId,
                    items: [
                        {
                            product: { ...item }, unit: qty
                        }
                    ]
                });
            }
        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
        }

    }


    async createNewOrder(customerId, txnId) {
        //check transaction for payment Status
        // txnId will be provided by the payment module

        let session = await CartModel.startSession();
        try {
            session.startTransaction();
            const opts = { session };

            const cart = await CartModel.findById(customerId);

            if (cart) {

                let amount = 0;

                let cartItems = cart.items;

                if (cartItems.length > 0) {
                    //process Order
                    cartItems.map(item => {
                        amount += parseInt(item.product.price) * parseInt(item.unit);
                    });

                    const orderId = uuidv4();

                    const order = new OrderModel({
                        orderId,
                        customerId,
                        amount,
                        txnId,
                        status: 'received',
                        items: cartItems
                    })

                    cart.items = [];
                    const orderResult = order.save(opts);
                    cart.save(opts);
                    await session.commitTransaction();
                    session.endSession();

                    return orderResult;
                }
            } else {
                await session.abortTransaction();
                session.endSession();
                throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No product found in the Cart.')
            }

        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Cart')
        }


    }
}

module.exports = ShoppingRepository;