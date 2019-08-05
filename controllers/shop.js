const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const Product = require('../models/Product');
const ITEMS_PER_PAGE = 6;
exports.index = (req, res) => {
  const page = +req.query.page || 1;
  let totalItem;
  Product.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Product.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((products) => {
    res.render('shop', {
      title: 'Shop',
      products,
      totalProducts:totalItem,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      totalItem:totalItem,
      lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
    });
  });
};

exports.getAddProduct = (req, res) => {
  res.render('add-product', {
    title: 'Add Product'
  });
};

exports.postAddProduct = (req, res) => {
  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
  var title = req.body.title;
  var price = req.body.price;
  var description = req.body.description;
  var stock = req.body.stock;
  var category = req.body.category;
  var subcategory = req.body.subcategory;

  var product = new Product({
    title:title,
    price:price,
    description:description,
    stock:stock,
    category:category,
    subcategory:subcategory,
    image:imageFile
  });

  product.save(function (err) {
    if(err) console.log(err);
    mkdirp('public/product_image/'+product._id);
    if (imageFile != "") {
      var productImage = req.files.image;
      var path = 'public/product_image/' + product.id + '/' + imageFile;
      productImage.mv(path);
    }
  });
  res.redirect('/shop/add-product');
};

exports.getDeleteProduct = (req, res) => {
  var id = req.params.id;
  var path = 'public/product_image/' + id;

  fs.remove(path, function (err) {
    if (err) {
      console.log(err);
    } else {
      Product.findByIdAndRemove(id, function (err) {
        console.log(err);
      });
      res.redirect('/shop/productsDatabase');
    }
  });
};

exports.getEditProduct = (req, res) => {
  var id = req.params.id;
  Product.findOne({_id:id}).then(
    (product)=>{
      res.render('edit-product', {
        title:'Edit Product',
        product
      });
    }
  )
};

exports.postEditProduct = (req, res) => {
  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
  var id = req.params.id;
  var title = req.body.title;
  var price = req.body.price;
  var description = req.body.description;
  var stock = req.body.stock;
  var category = req.body.category;
  var subcategory = req.body.subcategory;
  var pimage = req.body.pimage;

  Product.findById(id, function (err, b) {
    if (err)
      console.log(err);

    b.title = title;
    b.price = price;
    b.description = description;
    b.stock = stock;
    b.category = category;
    b.subcategory = subcategory;
    b.image = imageFile;

    b.save(function (err) {
      if (err)
        console.log(err);

      if (imageFile != "") {
        if (pimage != "") {
          fs.remove('public/product_image/' + id + '/' + pimage);
        }
        var productImage = req.files.image;
        var path = 'public/product_image/' + id + '/' + imageFile;
        productImage.mv(path);
      }
      res.redirect('/shop/edit-product/'+id);
    });

  });
};

exports.getProductsDatabase = (req, res) => {
  const page = +req.query.page || 1;
  let totalItem;
  Product.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Product.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((products) => {
    res.render('productsDatabase', {
      title: ' Products Database',
      products,
      totalProducts:totalItem,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      totalItem:totalItem,
      lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
    });
  });
};

exports.getSearchProductsDatabase = (req, res) => {
  var page = req.query.page||1;
  var category = req.params.category;
  var subcategory = req.params.subcategory;
  let totalItem;
  Product.find({category:category, subcategory:subcategory})
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Product.find({category:category, subcategory:subcategory})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((products) => {
    res.render('productsDatabase', {
      title: ' Products Database',
      products,
      totalProducts:totalItem,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      totalItem:totalItem,
      lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
    });
  });
};

exports.getPriceProductsDatabase = (req, res) => {
  var page = req.query.page||1;
  var priceFrom = req.body.priceFrom;
  var priceTo = req.body.priceTo;
  let totalItem;
  Product.find({price: {$gte: priceFrom, $lte: priceTo}})
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Product.find({price: {$gte: priceFrom, $lte: priceTo}})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((products) => {
    res.render('productsDatabase', {
      title: ' Products Database',
      products,
      totalProducts:totalItem,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      totalItem:totalItem,
      lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
    });
  });
};



