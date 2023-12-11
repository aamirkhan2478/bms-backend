import Agent from "../models/agent.model.js";

// @route   POST /api/agent/add
// @desc    Add new agent
// @access  Private
export const addAgent = async (req, res) => {
  const { name } = req.body;

  const { id } = req.user;

  try {
    const agent = new Agent({ name, createdBy: id });
    await agent.save();
    return res.status(201).json({ message: "Agent added successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/agent/all
// @desc    Get all agents
// @access  Private
export const showAgents = async (_req, res) => {
  try {
    const agents = await Agent.find().populate("createdBy", "name -_id");
    return res.status(200).json({ agents });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
