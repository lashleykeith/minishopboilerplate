/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('blog', {
    title: 'Blog'
  });
};
