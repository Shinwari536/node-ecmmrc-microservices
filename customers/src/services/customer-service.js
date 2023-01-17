const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors')


// All Business logic will be here
class CustomerService {

    constructor() {
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs) {

        const { email, password } = userInputs;

        try {

            const existingCustomer = await this.repository.findCustomer({ email });

            if (existingCustomer) {

                const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);

                if (validPassword) {
                    const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id });
                    return FormateData({ id: existingCustomer._id, token });
                }
            }

            return FormateData(null);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }


    }

    async SignUp(userInputs) {

        const { email, password, phone } = userInputs;

        try {
            // create salt
            let salt = await GenerateSalt();

            let userPassword = await GeneratePassword(password, salt);

            const existingCustomer = await this.repository.createCustomer({ email, password: userPassword, phone, salt });

            const token = await GenerateSignature({ email: email, _id: existingCustomer._id });

            return FormateData({ id: existingCustomer._id, token });

        } catch (err) {
            throw new APIError('Data Not found', err)
        }

    }

    async AddNewAddress(_id, userInputs) {

        const { street, postalCode, city, country } = userInputs;

        try {
            const addressResult = await this.repository.createAddress({ _id, street, postalCode, city, country })
            return FormateData(addressResult);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }


    }

    async GetProfile(id) {

        try {
            const existingCustomer = await this.repository.findCustomerById({ id });
            return FormateData(existingCustomer);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetShopingDetails(id) {

        try {
            const existingCustomer = await this.repository.findCustomerById({ id });

            if (existingCustomer) {
                return FormateData(existingCustomer);
            }
            return FormateData({ msg: 'Error' });

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetWishList(customerId) {

        try {
            const wishListItems = await this.repository.wishlist(customerId);
            return FormateData(wishListItems);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async AddToWishlist(customerId, product) {
        try {
            const wishlistResult = await this.repository.addWishlistItem(customerId, product);
            return FormateData(wishlistResult);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageCart(customerId, product, qty, isRemove) {
        try {
            const cartResult = await this.repository.addCartItem(customerId, product, qty, isRemove);
            return FormateData(cartResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageOrder(customerId, order) {
        try {
            const orderResult = await this.repository.addOrderToProfile(customerId, order);
            return FormateData(orderResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async SubscribeEvents(payload) {
        console.log(payload);

        const { event, data } = payload;

        const { userId, product, order, qty } = data;

        switch (event) {
            case 'ADD_TO_WISHLIST':
            case 'REMOVE_FROM_WISHLIST':
                this.AddToWishlist(userId, product)
                break;
            case 'ADD_TO_CART':
                this.ManageCart(userId, product, qty, false);
                break;
            case 'REMOVE_FROM_CART':
                this.ManageCart(userId, product, qty, true);
                break;
            case 'CREATE_ORDER':
                this.ManageOrder(userId, order);
                break;
            case 'TEST':
                console.log('Working fine ...');
                break;
            default:
                break;
        }

    }

}

module.exports = CustomerService;