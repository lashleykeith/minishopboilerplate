/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
var fileUpload = require('express-fileupload');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const aboutController = require('./controllers/about');
const shopController = require('./controllers/shop');
const checkoutController = require('./controllers/checkout');
const cartController = require('./controllers/cart');
const blogController = require('./controllers/blog');
const blogSingleController = require('./controllers/blog-single');
const productSingleController = require('./controllers/product-single');
const contactController = require('./controllers/contact');
const contactDatabaseController = require('./controllers/contactDatabase');
const servicesController = require('./controllers/services');
const workController = require('./controllers/work');
const workSingleController = require('./controllers/work-single');

/**
 * Create Express server.
 */
const app = express();
/**
 * File Upload
 */
app.use(fileUpload());


/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.',
    chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator({
  customValidators: {
    isImage: function (value, filename) {
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/checkout/place-order' || req.path === '/shop/priceProducts' || req.path === '/shop/priceProductsDatabase' || req.path === '/shop/add-product' || req.path === '/blog/blog-post' || req.path === '/contact' || req.path === '/contact/saveContact' || req.path.includes('/shop/edit-product/') || req.path.includes('/contact/edit/') || req.path.includes('/blog/edit/') || req.path.includes('/contact/sendEmail/') || req.path.includes('/contact/sendEmailPage/')) {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
// app.use(lusca.xframe("SAMEORIGIN"));
// app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.cart = req.session.cart;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)
  ) {
    req.session.returnTo = req.originalUrl;
  } else if (
    req.user
    && (req.path === '/account' || req.path.match(/^\/api/))
  ) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/',
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/chart.js/dist'), {
    maxAge: 31557600000
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), {
    maxAge: 31557600000
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
    maxAge: 31557600000
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
    maxAge: 31557600000
  }));
app.use('/webfonts',
  express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'),
    { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/about', aboutController.index);


app.get('/cart', cartController.index);
app.get('/cart/add-to-cart/:id/:category', cartController.getAddToCart);
app.get('/cart/increase-quantity/:id/:category', cartController.getIncreaseQuantity);
app.get('/cart/decrease-quantity/:id/:category', cartController.getDecreaseQuantity);
app.get('/cart/delete-product/:id/:category', cartController.getDeleteProduct);
app.get('/cart/empty-cart', cartController.getEmptyCart);
app.get('/cart/checkout', cartController.getToCheckout);




app.get('/product-single', productSingleController.index);
app.get('/product-single/readmore/:id', productSingleController.readmore);
app.get('/shop', shopController.index);
app.get('/shop/add-product', shopController.getAddProduct);
app.post('/shop/add-product', shopController.postAddProduct);
app.get('/shop/delete-product/:id', shopController.getDeleteProduct);
app.get('/shop/edit-product/:id', shopController.getEditProduct);
app.post('/shop/edit-product/:id', shopController.postEditProduct);
app.get('/shop/productsDatabase', shopController.getProductsDatabase);
app.get('/shop/searchProductsDatabase/:category/:subcategory', shopController.getSearchProductsDatabase);
app.post('/shop/priceProductsDatabase', shopController.getPriceProductsDatabase);
app.get('/shop/searchProducts/:category/:subcategory', shopController.getSearchProducts);
app.post('/shop/priceProducts', shopController.getPriceProducts);





app.get('/blog', blogController.index);
app.get('/blog/blog-post', blogController.getBlogPost);
app.post('/blog/blog-post', blogController.postBlogPost);
app.get('/blog/read-more/:id', blogController.getReadMore);
app.get('/blog/blogDatabase', blogController.getBlogDatabase);
app.get('/blog/delete/:id', blogController.getDeleteBlog);
app.get('/blog/edit/:id', blogController.getEditBlogPost);
app.post('/blog/edit/:id', blogController.postEditBlogPost);

app.get('/checkout', checkoutController.index);
app.post('/checkout/place-order', checkoutController.postPlaceOrder);


app.get('/blog-single', blogSingleController.index);
app.get('/contact', contactController.index);
app.post('/contact/saveContact', contactController.postSaveContact);
app.get('/contact/delete/:id', contactController.getDeleteContact);
app.get('/contact/edit/:id', contactController.getEditContact);
app.post('/contact/edit/:id', contactController.postEditContact);
app.get('/contact/getReport/:id', contactController.getReportContact);
app.get('/contact/sendEmail/:id', contactController.getSendEmailContact);
app.post('/contact/sendEmail/:id', contactController.postSendEmailContact);
app.get('/contact/deletePage/:page', contactController.getDeletePageContact);
app.get('/contact/savePage/:page', contactController.getSavePageContact);
app.get('/contact/sendEmailPage/:page', contactController.getSendEmailPageContact);
app.post('/contact/sendEmailPage/:page', contactController.postSendEmailPageContact);
/**
 * Databases
 */
app.get('/contactDatabase', contactDatabaseController.getContactDatabase);

app.get('/services', servicesController.index);
app.get('/work', workController.index);
app.get('/work-single', workSingleController.index);


if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
