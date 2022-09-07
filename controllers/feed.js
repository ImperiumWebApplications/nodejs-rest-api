const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const clearImage = require("../util/clearImage");

const POSTS_PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
  // Find all posts with pagination
  const currentPage = req.query.page || 1;
  // Post.find()
  //   .countDocuments()
  //   .then((count) => {
  //     totalItems = count;
  //     return Post.find()
  //       .skip((currentPage - 1) * POSTS_PER_PAGE)
  //       .limit(POSTS_PER_PAGE);
  //   })
  //   .then((posts) => {
  //     res.status(200).json({
  //       message: "Fetched posts successfully.",
  //       posts: posts,
  //       totalItems: totalItems,
  //     });
  //   })
  //   .catch((error) => {
  //     if (!error.statusCode) {
  //       error.statusCode = 500;
  //     }
  //     next(error);
  //   });
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE);
    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  // Create post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: req.file.path,
    creator: req.userData.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userData.userId);
    })

    .then((user) => {
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: {
          _id: post._id,
          title: title,
          content: content,
          createdAt: new Date(),
          creator: req.userData.userId,
        },
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let uploadedImageFilePath = req.file?.path;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (!uploadedImageFilePath) {
        uploadedImageFilePath = post.imageUrl;
      }

      if (uploadedImageFilePath !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      // Check if req.userData.userId is the creator of the post
      if (post.creator.toString() !== req.userData.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }

      post.title = title;
      post.content = content;
      post.imageUrl = uploadedImageFilePath;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      // Check whether the loggedin user is the creator of the post
      if (post.creator.toString() !== req.userData.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      // Find and remove the post from the user array for the creator of the post
      return User.findById(req.userData.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
