const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(bodyParser.json()); // application/json
app.use(cors());
app.use(express.static("images"));
app.use("/feed", feedRoutes);

const port = 8080;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));
