var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
var port = process.env.PORT || 5000;

// app congfig
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/blog_app', { useNewUrlParser: true });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
// Mongoose/model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});

var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
// 	title: 'Test BLOG',
// 	image:
// 		'https://images.unsplash.com/photo-1556710303-af0c5260e173?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
// 	body: 'Hello This is a blog post'
// });

// RESTFUL ROUTES
app.get('/', function(req, res) {
	res.redirect('/blogs');
});

//Index Route
app.get('/blogs', function(req, res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			res.render('index', { blogs: blogs });
		}
	});
});
// NEW Route
app.get('/blogs/new', function(req, res) {
	res.render('new');
});

//CREATE route
app.post('/blogs', function(req, res) {
	//console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//console.log('-----------------------------------------');
	//console.log(req.body);
	Blog.create(req.body.blog, function(err, newBlog) {
		if (err) {
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	});
});

// SHOW Route
app.get('/blogs/:id', function(req, res) {
	Blog.findById(req.params.id, function(err, foundblog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			// res.send(blog);
			res.render('show', { blog: foundblog });
		}
	});
});

//Edit Route
app.get('/blogs/:id/edit', function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findById(req.params.id, function(err, foundblog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', { blog: foundblog });
		}
	});
});

// UPDATE ROUTE
app.put('/blogs/:id/', function(req, res) {
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});
// DELETE ROUTE
app.delete('/blogs/:id', function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs');
		}
	});
});
app.listen(port, function() {
	console.log(`Server is running at port ${port}`);
});
