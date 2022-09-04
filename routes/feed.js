const express = require("express");
const { getPosts, addPost } = require("../controllers/feed");
const router = express.Router();

router.get("/posts", getPosts);
router.post("/posts", addPost);

module.exports = router;
