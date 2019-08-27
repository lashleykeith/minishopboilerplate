const Order = require('../models/Order');

exports.index = (req, res) => {
  res.render('checkout', {
    title: 'Checkout'
  });
};
exports.postPlaceOrder = async function (req, res) {
  let totalPrice = 0;
  const { cart } = req.session;
  const { firstname } = req.body;
  const { lastname } = req.body;
  const { country } = req.body;
  const { streetaddress } = req.body;
  const { appartment } = req.body;
  const { city } = req.body;
  const { postcode } = req.body;
  const { phone } = req.body;
  const { emailaddress } = req.body;
  const { optradio } = req.body;
  const order = await new Order();
  order.firstname = firstname;
  order.lastname = lastname;
  order.country = country;
  order.streetaddress = streetaddress;
  order.appartment = appartment;
  order.city = city;
  order.postcode = postcode;
  order.phone = phone;
  order.emailaddress = emailaddress;
  order.deliveryOption = optradio;
  cart.forEach((item) => {
    totalPrice += (item.productQuantity * item.productPrice);
    order.cart.push({
      productId: item.productId,
      productName: item.productName,
      productCategory: item.productCategory,
      productStock: item.productStock,
      productQuantity: item.productQuantity,
      productPrice: item.productPrice,
      productImage: item.productImage
    });
  });
  order.totalPrice = totalPrice;
  order.save();
  const { deliveryStatus } = req.body;
  if (deliveryStatus ==1){
    delete req.session.cart;
  }
  if (deliveryStatus == 0){
    delete req.session.cart;
    return res.redirect('/cart');
  }

};
