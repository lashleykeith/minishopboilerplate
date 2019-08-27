const Product = require('../models/Product');

exports.index = (req, res) => {
  if (req.session.cart && req.session.cart.length === 0) {
    delete req.session.cart;
    return res.render('cart', {
      title: 'cart',
      cart: null
    });
  }
  return res.render('cart', {
    title: 'cart',
    cart: req.session.cart
  });
};

exports.getAddToCart = (req, res) => {
  const { id } = req.params;
  Product.findOne({ _id: id }, (err, p) => {
    if (err) console.log(err);

    if (typeof req.session.cart === 'undefined') {
      req.session.cart = [];
      req.session.cart.push({
        productId: p._id,
        productName: p.title,
        productCategory: p.category,
        productStock: p.stock,
        productQuantity: 1,
        productPrice: parseFloat(p.price).toFixed(2),
        productImage: `/product_image/${p._id}/${p.image}`
      });
    } else {
      const { cart } = req.session;
      let newItem = true;

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].productId === id) {
          cart[i].productQuantity++;
          newItem = false;
          break;
        }
      }
      if (newItem) {
        cart.push({
          productId: p._id,
          productName: p.title,
          productCategory: p.category,
          productStock: p.stock,
          productQuantity: 1,
          productPrice: parseFloat(p.price).toFixed(2),
          productImage: `/product_image/${p._id}/${p.image}`
        });
      }
    }
    console.log(req.session.cart);
    res.redirect('back');
  });
};

exports.getIncreaseQuantity = (req, res) => {
  const { id } = req.params;
  const { cart } = req.session;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].productId === id) {
      if (cart[i].productQuantity < cart[i].productStock) {
        cart[i].productQuantity++;
      }
    }
  }
  res.redirect('/cart');
};

exports.getDecreaseQuantity = (req, res) => {
  const { id } = req.params;
  const { cart } = req.session;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].productId === id) {
      cart[i].productQuantity--;
      if (cart[i].productQuantity < 1) {
        cart.splice(i, 1);
      }
    }
  }
  res.redirect('/cart');
};

exports.getDeleteProduct = (req, res) => {
  const { id } = req.params;
  const { cart } = req.session;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === id) {
      cart.splice(i, 1);
      if (cart.length === 0) {
        delete req.session.cart;
      }
    }
  }
  res.redirect('/cart');
};

exports.getEmptyCart = (req, res) => {
  delete req.session.cart;
  res.redirect('/cart');
};

exports.getToCheckout = (req, res) => {
  res.render('checkout', {
    title: 'Checkout',
    cart: req.session.cart,
    PaypalDelivery: null
  });
};
