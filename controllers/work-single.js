/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('work-single', {
    title: 'Work'
  });
};
