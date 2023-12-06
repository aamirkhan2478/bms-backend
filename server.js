import express from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./middlewares/errors.middleware.js";
import swaggerSetup from "./swagger.js";
import connection from "./db/connection.js";
import userRouter from "./routes/user.route.js";
import inventoryRouter from "./routes/inventory.route.js";
import ownerRouter from "./routes/owner.route.js";
import tenantRouter from "./routes/tenant.route.js";
import auth from "./middlewares/auth.middleware.js";

// Initialize express
const app = express();

// Configure dotenv
dotenv.config({ path: "./.env.local" });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

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
app.use("/api/owner", auth, ownerRouter);
app.use("/api/tenant", auth, tenantRouter);
app.use(notFound);
app.use(errorHandler);

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    chalk.bold.greenBright(`Server is running on port http://localhost:${port}`)
  );
});
