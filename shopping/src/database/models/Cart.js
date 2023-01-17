const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartSchema = new Schema({
    customerId: String,
    items: [
        {
            product: {
                _id: { type: String, required: true },
                name: String,
                desc: String,
                banner: String,
                type: String,
                unit: String,
                price: Number,
                suplier: String,

            },
            unit: { type: Number, require: true }
        }
    ]
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
            }
        },
        timestamps: true
    });

module.exports = mongoose.model('cart', CartSchema);