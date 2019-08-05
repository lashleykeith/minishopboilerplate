const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  blogTitle: String,
  blogDescription: String,
  image: String,
  createdAt: String
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
