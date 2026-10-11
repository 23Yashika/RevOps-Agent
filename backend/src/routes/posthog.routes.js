import { Router } from "express";
import { getPostHogStatus, getPostHogAnalytics } from "../services/posthog.service.js";

const router = Router();

// GET /api/posthog/status
router.get("/status", async (req, res) => {
  const status = await getPostHogStatus();
  res.json({ success: true, ...status });
});

// GET /api/posthog/analytics
router.get("/analytics", async (req, res) => {
  try {
    const data = await getPostHogAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, connected: false, message: error.message });
  }
});

export default router;