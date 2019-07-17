/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('product-single', {
    title: 'Product Single'
  });
};
