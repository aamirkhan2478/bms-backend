import express from "express";
const router = express.Router();
import { addAgent, showAgents } from "../controllers/agent.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import agentSchema from "../validator/agent.validator.js";

router.route("/add").post(validatorMiddleware(agentSchema), addAgent);
router.route("/all").get(showAgents);

export default router;
