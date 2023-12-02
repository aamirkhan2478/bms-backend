import express from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./middlewares/errors.middleware.js";
import swaggerSetup from "./swagger.js";
import connection from "./db/connection.js";
import userRouter from "./routes/user.route.js";
import inventoryRouter from "./routes/inventory.route.js";
import auth from "./middlewares/auth.middleware.js";

// Initialize express
const app = express();

// Configure dotenv
dotenv.config({ path: "./.env.local" });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: process.env.CLIENT_URL }));

// Configure Swagger
swaggerSetup(app);

//Database Connection
connection();

// Starting endpoint
app.get("/", (_req, res) => {
  res.send("<h1 style='color:green;'>Hurrah! Server is running.</h1>");
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/inventory", auth, inventoryRouter);
app.use(notFound);
app.use(errorHandler);

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    chalk.bold.greenBright(`Server is running on port http://localhost:${port}`)
  );
});
