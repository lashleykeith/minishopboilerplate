/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('checkout', {
    title: 'Checkout'
  });
};
