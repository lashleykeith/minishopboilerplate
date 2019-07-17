/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('cart', {
    title: 'Cart'
  });
};
