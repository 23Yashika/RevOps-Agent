
import { Router } from "express";
import {
  createProposedAction,
  getProposedActions,
  approveProposedAction,
  rejectProposedAction,
  executeProposedAction,
} from "../services/action.service.js";

const router = Router();

// GET /api/actions?status=PENDING
router.get("/", async (req, res) => {
  try {
    const actions = await getProposedActions({
      status: req.query.status || undefined,
      limit: req.query.limit || 50,
    });

    res.json({
      success: true,
      count: actions.length,
      actions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/actions
router.post("/", async (req, res) => {
  try {
    const action = await createProposedAction({
      ...req.body,
      actor: "api-user",
    });

    res.status(201).json({
      success: true,
      action,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/actions/:id/approve
router.post("/:id/approve", async (req, res) => {
  try {
    const action = await approveProposedAction({
      id: req.params.id,
      actor: req.body.actor || "api-user",
      note: req.body.note,
    });

    res.json({
      success: true,
      action,
    });
  } catch (error) {
    const status = error.message === "Proposed action not found." ? 404 : 400;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/actions/:id/reject
router.post("/:id/reject", async (req, res) => {
  try {
    const action = await rejectProposedAction({
      id: req.params.id,
      actor: req.body.actor || "api-user",
      note: req.body.note,
    });

    res.json({
      success: true,
      action,
    });
  } catch (error) {
    const status = error.message === "Proposed action not found." ? 404 : 400;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
});


/**
 * POST /api/actions/:id/execute
 * Executes an approved action in dry-run mode.
 */
router.post("/:id/execute", async (req, res) => {
  try {
    const result = await executeProposedAction({
      id: req.params.id,
      actor: req.body.actor || "api-user",
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message = error.message || "Action execution failed.";

    const status = message === "Proposed action not found."
      ? 404
      : message.includes("not configured yet")
        ? 501
        : 400;

    res.status(status).json({
      success: false,
      message,
    });
  }
});

export default router;
