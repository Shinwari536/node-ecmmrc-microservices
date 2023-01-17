const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");
const { APIError } = require('../utils/app-errors');

// All Business logic will be here
class ProductService {

    constructor() {
        this.repository = new ProductRepository();
    }

    async CreateProduct(productInputs) {
        try {
            const productResult = await this.repository.CreateProduct(productInputs)
            return FormateData(productResult);
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    async GetProducts() {
        try {
            const products = await this.repository.Products();

            let categories = {};

            products.map(({ type }) => {
                categories[type] = type;
            });

            return FormateData({
                products,
                categories: Object.keys(categories),
            })

        } catch (err) {
            throw new APIError('Data Not found')
        }
    }


    async GetProductDescription(productId) {
        try {
            const product = await this.repository.FindById(productId);
            return FormateData(product)
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    async GetProductsByCategory(category) {
        try {
            const products = await this.repository.FindByCategory(category);
            return FormateData(products)
        } catch (err) {
            throw new APIError('Data Not found')
        }

    }

    async GetSelectedProducts(selectedIds) {
        try {
            const products = await this.repository.FindSelectedProducts(selectedIds);
            return FormateData(products);
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    async GetProductById(productId) {
        try {
            return await this.repository.FindById(productId);
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    async getProductPayload(userId, { productId, qty }, event) {
        const product = await this.repository.FindById(productId);
        // console.log("Product: ", product);

        if (product) {
            let payload;
            switch (event) {
                case 'ADD_TO_WISHLIST':
                case 'REMOVE_FROM_WISHLIST':
                    payload = {
                        event: event,
                        data: {
                            userId,
                            product: { _id: product._id, name: product.name, dec: product.desc, banner: product.banner, available: product.available, price: product.price },
                        }
                    }
                    return FormateData(payload);
                case 'ADD_TO_CART':
                case 'REMOVE_FROM_CART':
                    payload = {
                        event: event,
                        data: {
                            userId, 
                            product: { _id: product._id, name: product.name, banner: product.banner, price: product.price },
                            qty
                        }
                    }
                    return FormateData(payload);
                default:
                    break;
            }

        } else {
            console.log("I am here- failed");

            return FormateData(new Error("No product found."));
        }
    }

}

module.exports = ProductService;