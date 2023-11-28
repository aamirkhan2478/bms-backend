const express = require("express");
const app = express();
const chalk = require("chalk");
const cors = require("cors");
require("dotenv").config({path: "./.env.local"});
const { notFound, errorHandler } = require("./middlewares/errors");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: process.env.CLIENT_URL }));

//Database Connection
require("./db/connection");

// Starting endpoint
app.get("/", (_req, res) => {
    res.send("<h1 style='color:green;'>Hurrah! Server is running.</h1>");
});

// Routes
app.use("/api/user", require("./routes/userRoute"));
app.use(notFound);
app.use(errorHandler);
// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    chalk.bold.greenBright(`Server is running on port http://localhost:${port}`)
  );
});
