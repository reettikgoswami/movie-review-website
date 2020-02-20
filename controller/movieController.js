var mongoose = require('mongoose');
var path = require("path");
var fs = require("fs");



//require the database models
var Movie = require("../models/movie");
var Comment = require("../models/comment");

//render all the forms
function viewIndex(req, res, next) {
  Movie.find({}, (err, movies) => {
    if (err) {
      return console.log(err)
    }
    res.render('index', {
      movies ,
      userDetail: req.userDetail 
    });
  })
}

function renderAddForm(req, res, next) {
  res.render("addMovie" , { userDetail : req.userDetail});
}


function renderEditForm(req, res, next) {
  // send the data to the edit page
  let movieId = req.params.id;
  Movie.findById(movieId, (err, movie) => {
    if (err) {
      next(err);
    }
    res.render("editMovie", {
      movie ,
      userDetail : req.userDetail
    });
  })
}


// database 
function addIntoTheDatabase(req, res, next) {
  let movieObj = req.body;
  let imgPath = "/images/uploads/" + req.file.originalname;
  movieObj.imgSrc = imgPath;
  Movie.create(movieObj, (err, data) => {
    if (err) {
      return console.log(err)
    }
    console.log(data);
    res.redirect("/");
  })
 
  //   //chenge
}

// edit the movie into the database
function editTheMovie(req, res) {
  let movieId = req.params.id;
  let imgPath = "/images/uploads/" + req.file.originalname; //add the img path
  req.body.imgSrc = imgPath;
  Movie.findById(movieId, (err, movie) => {
    if (err) {
      return console.log(err);
    }
    let deleteImagePath = path.join(__dirname, "../public" + movie.imgSrc);
    fs.unlink(deleteImagePath, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log('old movie poster deleted');
      Movie.findByIdAndUpdate(movieId, req.body, (err, editedMovie) => {
        if (err) {
          return console.log(err);
        }
        res.redirect('/');
      })
    })
  })
}



// render detail view page  
function renderViewMovie(req, res) {
  let movieId = req.params.id;
  Movie.findById(movieId).populate("comments").exec((err, movie) => {
    if (err) {
      return console.log(err);
    }
    res.render("viewMovie", {
      movie ,
      userDetail : req.session.userDetail
    });
  })
}


// delete the movie from the database
function deleteFromTheDatabase(req, res) {
  let movieId = req.params.id;
  Movie.findByIdAndDelete(movieId, (err, movie) => {
    if (err) {
      return console.log(err);
    }
    //delete the movie comments into the database 
    Comment.deleteMany({
      movieId: movie.id
    }, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("commnet deleted successfully");
    })
    //delele the public/image/imgName into the folder 
    let deleteImagePath = path.join(__dirname, "../public" + movie.imgSrc);
    fs.unlink(deleteImagePath, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log('movie deleted succesfully');
    })
    // console.log(movie);
    res.redirect("/");
  })
  return;
}


// add comments in the movie
function addComment(req, res) {
  let movieId = req.params.id;
  //  let commentObj = req.body;
  req.body.movieId = movieId;
  console.log("comment section a vetor a achi", req.body);
  Comment.create(req.body, (err, createdComment) => {
    if (err) {
      return console.log(err);
    }
    Movie.findByIdAndUpdate(
      movieId, {
        $push: {
          comments: createdComment.id
        }
      },
      (err, movie) => {
        if (err) {
          return console.log(err)
        }
        res.redirect(`/movie/${movieId}`);
      }
    )
  })
}


module.exports = {
  viewIndex,
  renderAddForm,
  renderEditForm,
  addIntoTheDatabase,
  renderViewMovie,
  deleteFromTheDatabase,
  addComment,
  editTheMovie
}