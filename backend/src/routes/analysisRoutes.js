
import express from "express";
import { runRevOpsAgent } from "../agent/orchestrator.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("REVOPS ORCHESTRATOR ROUTE HIT");

  res.setHeader("X-Analysis-Route", "orchestrator");

  try {
    const parsedLimit = Number.parseInt(req.query.limit, 10);

    const limit = Number.isNaN(parsedLimit)
      ? 10
      : Math.min(Math.max(parsedLimit, 1), 100);

    const result = await runRevOpsAgent({ limit });

    return res.status(200).json(result);
  } catch (error) {
    console.error("RevOps orchestrator failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run the RevOps agent.",
      error: error.message || "Unknown server error",
    });
  }
});

export default router;
