const express = require("express");
const { getPosts, addPost } = require("../controllers/feed");
const router = express.Router();
const { body } = require("express-validator/check");

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

module.exports = router;
