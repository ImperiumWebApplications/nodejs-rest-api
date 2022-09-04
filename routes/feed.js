const express = require("express");
const { getPosts, addPost, getPost } = require("../controllers/feed");
const router = express.Router();
const { body } = require("express-validator");

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post(
  "/posts",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],

  addPost
);

// GET /feed/post/:postId
router.get("/post/:postId", getPost);

module.exports = router;
