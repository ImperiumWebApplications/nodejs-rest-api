const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");
const socket = require("socket.io");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
dotenv.config();

const app = express();
app.use(bodyParser.json()); // application/json
app.use(cors());
// Multer configures where to store the files
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
// Multer configures what files to accept
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  }
  cb(null, false);
};
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static("images"));
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

const port = 8080;

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const server = app.listen(port);
    // Setup socket.io
    const io = socket(server, {
      cors: {
        origin: "*",
      },
    });
    io.on("connection", (socket) => {
      console.log("Made socket connection", socket.id);
      // socket.on("chat", (data) => {
      //   io.sockets.emit("chat", data);
      // });
      // socket.on("typing", (data) => {
      //   socket.broadcast.emit("typing", data);
      // });
    });
  })
  .catch((err) => console.log(err));
