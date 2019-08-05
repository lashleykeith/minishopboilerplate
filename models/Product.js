const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  stock: Number,
  category: String,
  subcategory: String,
  image: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
