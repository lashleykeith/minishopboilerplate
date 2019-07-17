/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('work', {
    title: 'Work'
  });
};
