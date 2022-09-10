const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

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
        "somesupersecretsecret",
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
};
