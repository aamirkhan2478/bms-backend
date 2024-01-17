import Agent from "../models/agent.model.mjs";
import { ApiResponse } from "../utils/ApiResponse.mjs";
import asyncHandler from "../utils/AsyncHandler.mjs";

// @route   POST /api/agent/add
// @desc    Add new agent
// @access  Private
export const addAgent = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const { _id: id } = req.user;

  const agent = new Agent({ name, createdBy: id });
  await agent.save();

  return res.status(201).json(new ApiResponse(200, { agent }, "Agent added"));
});

// @route   GET /api/agent/all
// @desc    Get all agents
// @access  Private
export const showAgents = asyncHandler(async (_, res) => {
    const agents = await Agent.find().populate("createdBy", "name -_id");
    return res.status(200).json(new ApiResponse(200, { agents }, "Agents found"));
});
