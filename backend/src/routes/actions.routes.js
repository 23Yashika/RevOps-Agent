
import { Router } from "express";
import prisma from "../config/database.js";
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

  if (action.type === "DRAFT_EMAIL") {
    const result = await executeProposedAction({
      id: action.id,
      actor: req.body.actor || "api-user",
    });

    return res.json({
      success: true,
      action: result.action,
      execution: {
        dryRun: result.dryRun,
        message: result.message,
      },
    });
  }

  return res.json({
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

/**
 * POST /api/actions/send-email
 * Direct follow-up email execution from Deal Intelligence or Action panel.
 */
router.post("/send-email", async (req, res) => {
  try {
    const { dealId, accountName, subject, body, to, actor } = req.body;

    const targetRecipient =
      process.env.CLIENT_EMAIL ||
      (process.env.GMAIL_ALLOWED_RECIPIENTS
        ? process.env.GMAIL_ALLOWED_RECIPIENTS.split(",")[0].trim()
        : null) ||
      to;

    if (!targetRecipient || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: "Recipient, subject, and body are required.",
      });
    }

    // 1. Look for existing pending DRAFT_EMAIL action for this account
    let actionToExecute = await prisma.proposedAction.findFirst({
      where: {
        type: "DRAFT_EMAIL",
        status: "PENDING",
        ...(accountName ? { accountName } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!actionToExecute) {
      actionToExecute = await createProposedAction({
        accountName: accountName || "Deal Follow-up",
        type: "DRAFT_EMAIL",
        payload: {
          dealId: dealId || null,
          to: targetRecipient,
          subject,
          body,
          sent: false,
        },
        rationale: "Direct follow-up email sent from deal intelligence.",
        actor: actor || "api-user",
      });
    }

    // Approve the action if it's pending
    if (actionToExecute.status === "PENDING") {
      actionToExecute = await approveProposedAction({
        id: actionToExecute.id,
        actor: actor || "api-user",
        note: "Approved via Follow-up Email section",
      });
    }

    // Execute the action (sends the email to client)
    const result = await executeProposedAction({
      id: actionToExecute.id,
      actor: actor || "api-user",
    });

    res.json({
      success: true,
      action: result.action,
      execution: {
        dryRun: result.dryRun,
        message: result.message,
      },
    });
  } catch (error) {
    console.error("Direct send-email failed:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send follow-up email.",
    });
  }
});

export default router;
