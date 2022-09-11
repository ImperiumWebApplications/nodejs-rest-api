const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const clearImage = require("../util/clearImage");

module.exports = {
  signup: async function ({ email, password, name }, req) {
    try {
      const errors = [];
      if (!validator.isEmail(email)) {
        errors.push({ message: "E-Mail is invalid." });
      }
      if (
        validator.isEmpty(password) ||
        !validator.isLength(password, { min: 5 })
      ) {
        errors.push({ message: "Password too short!" });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }

      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        const error = new Error("User exists already!");
        error.statusCode = 422;
        throw error;
      }
      const hashedPw = await bcrypt.hash(password, 12);
      const user = new User({
        email: email,
        name: name,
        password: hashedPw,
        status: "I am new!",
      });
      const createdUser = await user.save();
      return { ...createdUser._doc, _id: createdUser._id.toString() };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  login: async function ({ email, password }, req) {
    try {
      const errors = [];
      if (!validator.isEmail(email)) {
        errors.push({ message: "E-Mail is invalid." });
      }
      if (
        validator.isEmpty(password) ||
        !validator.isLength(password, { min: 5 })
      ) {
        errors.push({ message: "Password too short!" });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }

      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 401;
        throw error;
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return { token: token, userId: user._id.toString() };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },

  createPost: async function ({ postInput }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }

      if (postInput.imageUrl === "undefined") {
        const error = new Error("No file picked.");
        error.statusCode = 422;
        throw error;
      }
      const errors = [];
      if (
        validator.isEmpty(postInput.title) ||
        !validator.isLength(postInput.title, { min: 5 })
      ) {
        errors.push({ message: "Title is invalid." });
      }
      if (
        validator.isEmpty(postInput.content) ||
        !validator.isLength(postInput.content, { min: 5 })
      ) {
        errors.push({ message: "Content is invalid." });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }

      const user = await User.findById(req.userData.userId);
      if (!user) {
        const error = new Error("Invalid user.");
        error.statusCode = 401;
        throw error;
      }
      const post = new Post({
        title: postInput.title,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
        creator: user,
      });
      const createdPost = await post.save();
      user.posts.push(createdPost);
      await user.save();
      return {
        ...createdPost._doc,
        _id: createdPost._id.toString(),
        createdAt: createdPost.createdAt.toISOString(),
        updatedAt: createdPost.updatedAt.toISOString(),
      };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  getPosts: async function ({ page }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      if (!page) {
        page = 1;
      }
      const perPage = 2;
      const totalPosts = await Post.find().countDocuments();
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate("creator");
      return {
        posts: posts.map((p) => {
          return {
            ...p._doc,
            _id: p._id.toString(),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        }),
        totalPosts: totalPosts,
      };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  getPost: async function ({ postId }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      const post = await Post.findById(postId).populate("creator");
      if (!post) {
        const error = new Error("No post found!");
        error.statusCode = 404;
        throw error;
      }
      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  updatePost: async function ({ id, postInput }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      const post = await Post.findById(id).populate("creator");
      if (!post) {
        const error = new Error("No post found!");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator._id.toString() !== req.userData.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      const errors = [];
      if (
        validator.isEmpty(postInput.title) ||
        !validator.isLength(postInput.title, { min: 5 })
      ) {
        errors.push({ message: "Title is invalid." });
      }
      if (
        validator.isEmpty(postInput.content) ||
        !validator.isLength(postInput.content, { min: 5 })
      ) {
        errors.push({ message: "Content is invalid." });
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input.");
        error.data = errors;
        error.code = 422;
        throw error;
      }
      post.title = postInput.title;
      post.content = postInput.content;
      if (postInput.imageUrl !== "undefined") {
        post.imageUrl = postInput.imageUrl;
      }
      const updatedPost = await post.save();
      return {
        ...updatedPost._doc,
        _id: updatedPost._id.toString(),
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
      };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  deletePost: async function ({ id }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      const post = await Post.findById(id);
      if (!post) {
        const error = new Error("No post found!");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userData.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      await Post.findByIdAndRemove(id);
      const user = await User.findById(req.userData.userId);
      user.posts.pull(id);
      await user.save();
      return true;
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  getUserStatus: async function (args, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      const user = await User.findById(req.userData.userId);
      if (!user) {
        const error = new Error("Invalid user.");
        error.statusCode = 401;
        throw error;
      }
      return { status: user.status };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
  updateUserStatus: async function ({ status }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      const user = await User.findById(req.userData.userId);
      if (!user) {
        const error = new Error("Invalid user.");
        error.statusCode = 401;
        throw error;
      }
      user.status = status;
      await user.save();
      return user;
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  },
};
