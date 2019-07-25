var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

const Blog = require('../models/Blog');

const ITEMS_PER_PAGE = 5;
exports.index = (req, res) => {
  const page = +req.query.page || 1;
  let totalItem;
  Blog.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Blog.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((blogs) => {
    res.render('blog', {
      title: ' Blog',
      blogs,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
    });
  });
};

exports.getBlogPost = (req, res) => {
  res.render('blog-post', {
    title: 'Blog Post'
  });
};

exports.postBlogPost = (req, res) => {
  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
  var blogTitle = req.body.blogTitle;
  var blogDescription = req.body.blogDescription;

  var blog = new Blog({
    blogTitle: blogTitle,
    blogDescription: blogDescription,
    image:imageFile
  });

  blog.save(function (err) {
    if(err) console.log(err);
    mkdirp('public/post_image/'+blog._id);
    if (imageFile != "") {
      var productImage = req.files.image;
      var path = 'public/post_image/'+blog.id+'/'+ imageFile;
      productImage.mv(path);
    }
  });
  res.redirect('/blog/blog-post');
};

exports.getReadMore = (req, res) => {
  var id = req.params.id;
  Blog.findOne({_id:id}).then(
    (blog)=>{
      res.render('blog-single', {
        title:'Blog Details',
        blog
      });
    }
  )
};

exports.getBlogDatabase = (req,res)=>{
  const page = +req.query.page || 1;
  let totalItem;
  Blog.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Blog.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((blogs) => {
    res.render('blogDatabase', {
      title: ' Blog Database',
      blogs,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItem,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
    });
  });
};

exports.getDeleteBlog = (req, res) => {
  var id = req.params.id;
  var path = 'public/post_image/' + id;

  fs.remove(path, function (err) {
    if (err) {
      console.log(err);
    } else {
      Blog.findByIdAndRemove(id, function (err) {
        console.log(err);
      });
      res.redirect('/blog/blogDatabase');
    }
  });
};

exports.getEditBlogPost = (req, res) => {
  var id = req.params.id;
  Blog.findOne({_id:id}).then(
    (blog)=>{
      res.render('edit-blog-post', {
        title:'Edit Blog Post',
        blog
      });
    }
  )
};

exports.postEditBlogPost = (req, res) => {
  var id = req.params.id;
  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
  var blogTitle = req.body.blogTitle;
  var blogDescription = req.body.blogDescription;
  var pimage = req.body.pimage;
  Blog.findById(id, function (err, b) {
    if (err)
      console.log(err);

    b.blogTitle = blogTitle;
    b.blogDescription = blogDescription
    b.image = imageFile;

    b.save(function (err) {
      if (err)
        console.log(err);

      if (imageFile != "") {
        if (pimage != "") {
          fs.remove('public/post_image/' + id + '/' + pimage, function (err) {
            if (err)
              console.log(err);
          });
        }

        var productImage = req.files.image;
        var path = 'public/post_image/' + id + '/' + imageFile;

        productImage.mv(path, function (err) {
          return console.log(err);
        });

      }
      res.redirect('/blog/edit/'+id);
    });

  });
};
