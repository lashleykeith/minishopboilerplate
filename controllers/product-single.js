const Product = require('../models/Product');

exports.index = (req, res) => {
  res.render('product-single', {
    title: 'Product Single'
  });
};

exports.readmore = (req, res) => {
  var id = req.params.id;
  Product.findOne({_id:id}).then(
    (product)=>{
      res.render('product-details', {
        title:'Product Details',
        product
      })
    }
  )
};


