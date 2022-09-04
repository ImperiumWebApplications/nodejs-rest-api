const express = require("express");
const { getPosts, addPost } = require("../controllers/feed");
const router = express.Router();

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post("/posts", addPost);

module.exports = router;
