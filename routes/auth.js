const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const router = express.Router();
const User = require("../models/user");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long."),
    body("name").trim().not().isEmpty().withMessage("Name must not be empty."),
  ],
  authController.postSignup
);

router.post("/login", [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),
], authController.postLogin);

module.exports = router;
