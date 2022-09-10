const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    req.isAuth = true;
    next();
  } catch (error) {
    req.isAuth = false;
    next();
    // res.status(401).json({ message: "You are not authenticated!" });
  }
};
