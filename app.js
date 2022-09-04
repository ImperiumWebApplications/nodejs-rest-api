const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const cors = require("cors");

const app = express();
app.use(bodyParser.json()); // application/json
app.use(cors());
app.use("/feed", feedRoutes);

const port = 8080;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
