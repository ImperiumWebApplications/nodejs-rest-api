const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const clearImage = require("../util/clearImage");

const POSTS_PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
  // Find all posts with pagination
  const currentPage = req.query.page || 1;
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

exports.addPost = async (req, res, next) => {
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
  try {
    await post.save();
    const user = await User.findById(req.userData.userId);
    user.posts.push(post);
    await user.save();
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await Post.findById(postId);
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
    await post.save();
    res.status(200).json({ message: "Post updated!", post: post });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
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
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userData.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: "Deleted post." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
