/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('services', {
    title: 'Services'
  });
};
