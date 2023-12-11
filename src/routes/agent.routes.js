import express from "express";
const router = express.Router();
import { addAgent, showAgents } from "../controllers/agent.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import agentSchema from "../validator/agent.validator.js";

router
  .post(
    "/add",
    upload.array("images", 10),
    validatorMiddleware(agentSchema),
    addAgent
  )
  .get("/all", showAgents);

export default router;
