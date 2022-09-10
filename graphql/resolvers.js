const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

module.exports = {
  signup: async function ({ email, password, name, status }, req) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
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
        status: status,
      });
      const createdUser = await user.save();
      return { ...createdUser._doc, _id: createdUser._id.toString() };
    } catch (error) {
      throw error;
    }
  },
  hello: function () {
    return "Hello world!";
  },
};
