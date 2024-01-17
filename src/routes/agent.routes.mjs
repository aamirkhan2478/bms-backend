import express from "express";
const router = express.Router();
import { addAgent, showAgents } from "../controllers/agent.controller.mjs";
import validatorMiddleware from "../middlewares/validator.middleware.mjs";
import agentSchema from "../validator/agent.validator.mjs";

router.route("/add").post(validatorMiddleware(agentSchema), addAgent);
router.route("/all").get(showAgents);

export default router;
