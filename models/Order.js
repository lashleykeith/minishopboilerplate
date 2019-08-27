const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  productCategory: String,
  productStock: String,
  productQuantity: String,
  productPrice: String,
  productImage: String
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  country: String,
  streetaddress: String,
  appartment: String,
  city: String,
  postcode: String,
  phone: String,
  emailaddress: String,
  deliveryOption: String,
  cart: [cartSchema],
  totalPrice: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
