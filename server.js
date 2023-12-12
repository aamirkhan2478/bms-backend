import express from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./src/middlewares/errors.middleware.js";
import swaggerSetup from "./swagger.js";
import connection from "./src/db/connection.js";
import userRouter from "./src/routes/user.routes.js";
import inventoryRouter from "./src/routes/inventory.routes.js";
import ownerRouter from "./src/routes/owner.routes.js";
import tenantRouter from "./src/routes/tenant.routes.js";
import contractRouter from "./src/routes/contract.routes.js";
import agentRouter from "./src/routes/agent.routes.js";
import auth from "./src/middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";

// Initialize express
const app = express();

// Configure dotenv
dotenv.config({ path: "./.env.local" });

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(cors({ origin: process.env.CLIENT_URL }));

app.use(cookieParser());

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
app.use("/api/contract", auth, contractRouter);
app.use("/api/agent", auth, agentRouter);

app.use(notFound);
app.use(errorHandler);

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    chalk.bold.greenBright(`Server is running on port http://localhost:${port}`)
  );
});
