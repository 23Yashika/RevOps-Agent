
import prisma from "../config/database.js";
import { sendGmailMessage } from "../routes/googleRoutes.js";

const ACTION_TYPES = [
  "NOTIFY_OWNER",
  "DRAFT_EMAIL",
  "CREATE_TASK",
  "UPDATE_CRM",
];

const VALID_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXECUTING",
  "EXECUTED",
  "FAILED",
];

// Create a proposed action and record it in the audit log.
export async function createProposedAction({
  accountName,
  type,
  payload,
  rationale,
  evidenceIds = [],
  analysisRunId,
  actor = "system",
}) {
  if (!accountName?.trim()) {
    throw new Error("Account name is required.");
  }

  if (!ACTION_TYPES.includes(type)) {
    throw new Error("Invalid action type.");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Payload must be an object.");
  }

  if (!rationale?.trim()) {
    throw new Error("Rationale is required.");
  }

  return prisma.$transaction(async (tx) => {
    const action = await tx.proposedAction.create({
      data: {
        accountName: accountName.trim(),
        type,
        payload,
        rationale: rationale.trim(),
        evidenceIds,
        ...(analysisRunId ? { analysisRunId } : {}),
      },
    });

    await tx.auditLog.create({
      data: {
        action: "ACTION_CREATED",
        actor,
        proposedActionId: action.id,
        details: {
          accountName: action.accountName,
          type: action.type,
          status: action.status,
        },
      },
    });

    return action;
  });
}

// List actions, optionally filtered by status.
export async function getProposedActions({ status, limit = 50 } = {}) {
  if (status && !VALID_STATUSES.includes(status)) {
    throw new Error("Invalid action status.");
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  return prisma.proposedAction.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: safeLimit,
  });
}

// Shared approval/rejection logic.
async function reviewAction({ id, actor, note, decision }) {
  if (!id || !actor?.trim()) {
    throw new Error("Action ID and reviewer are required.");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.proposedAction.findUnique({
      where: { id },
    },
    {
      maxWait: 20000,
      timeout: 30000,
    }
  
  );

    if (!existing) {
      throw new Error("Proposed action not found.");
    }

    if (existing.status !== "PENDING") {
      throw new Error(
        `Only pending actions can be reviewed. Current status: ${existing.status}`
      );
    }

    const updated = await tx.proposedAction.updateMany({
      where: {
        id,
        status: "PENDING",
      },
      data: {
        status: decision,
        approver: actor.trim(),
        approvalNote: note?.trim() || null,
        ...(decision === "APPROVED"
          ? { approvedAt: new Date() }
          : { rejectedAt: new Date() }),
      },
    });

    if (updated.count !== 1) {
      throw new Error("Action was already reviewed. Refresh and try again.");
    }

    await tx.auditLog.create({
      data: {
        action:
          decision === "APPROVED"
            ? "ACTION_APPROVED"
            : "ACTION_REJECTED",
        actor: actor.trim(),
        proposedActionId: id,
        details: {
          note: note?.trim() || null,
          previousStatus: "PENDING",
          newStatus: decision,
        },
      },
    });

    return tx.proposedAction.findUnique({
      where: { id },
    });
  });
}

export async function approveProposedAction({ id, actor, note }) {
  return reviewAction({
    id,
    actor,
    note,
    decision: "APPROVED",
  });
}

export async function rejectProposedAction({ id, actor, note }) {
  return reviewAction({
    id,
    actor,
    note,
    decision: "REJECTED",
  });
}

// Phase 7: Safe dry-run execution.
// No external service is called by this function yet.

export async function executeProposedAction({
  id,
  actor = "api-user",
}) {
  if (!id || !actor?.trim()) {
    throw new Error("Action ID and executor are required.");
  }

  const dryRun = process.env.DRY_RUN === "true";

  console.log("[EMAIL EXECUTION MODE]", {
    dryRun,
    configuredValue: process.env.DRY_RUN,
  });

  console.log("[ACTION EXECUTION ATTEMPT]", {
    actionId: id,
    actor,
    dryRun,
  });

  // Claim the action atomically so concurrent requests cannot both send it.
  const claimedAction = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.proposedAction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Proposed action not found.");
      }

      if (existing.status !== "APPROVED") {
        throw new Error(
          `Only approved actions can be executed. Current status: ${existing.status}`
        );
      }

      if (!dryRun && existing.type !== "DRAFT_EMAIL") {
        throw new Error(
          `Real execution is not configured for ${existing.type}.`
        );
      }

      const claimed = await tx.proposedAction.updateMany({
        where: { id, status: "APPROVED" },
        data: {
          status: "EXECUTING",
          errorMessage: null,
        },
      });

      if (claimed.count !== 1) {
        throw new Error(
          "Action could not be claimed. It may already be executing or completed."
        );
      }

      await tx.auditLog.create({
        data: {
          action: "ACTION_EXECUTION_STARTED",
          actor: actor.trim(),
          proposedActionId: id,
          details: {
            mode: dryRun ? "DRY_RUN" : "LIVE",
            previousStatus: "APPROVED",
            newStatus: "EXECUTING",
          },
        },
      });

      return existing;
    },
    { maxWait: 20000, timeout: 30000 }
  );

  console.log("[ACTION EXECUTION CLAIMED]", {
    actionId: claimedAction.id,
    type: claimedAction.type,
    status: claimedAction.status,
  });

  try {
    let externalId = null;

    if (!dryRun) {
      const payload = claimedAction.payload;

      const targetEmail =
        process.env.TEST_RECIPIENT_EMAIL ||
        process.env.CLIENT_EMAIL ||
        (process.env.GMAIL_ALLOWED_RECIPIENTS
          ? process.env.GMAIL_ALLOWED_RECIPIENTS.split(",")[0].trim()
          : null) ||
        payload?.to ||
        "radspatidar16@gmail.com";

      const emailSubject =
        (typeof payload?.subject === "string" && payload.subject.trim())
          ? payload.subject.trim()
          : `Following up regarding ${claimedAction.accountName || "your proposal"}`;

      const emailBody =
        (typeof payload?.body === "string" && payload.body.trim())
          ? payload.body.trim()
          : `Hi team,\n\nI wanted to quickly follow up on our previous conversation regarding ${claimedAction.accountName || "our proposal"}.\n\nBest regards,\nRevenue Operations`;

      const sent = await sendGmailMessage({
        to: targetEmail,
        subject: emailSubject,
        body: emailBody,
      });

      externalId = sent.messageId;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.proposedAction.updateMany({
          where: { id, status: "EXECUTING" },
          data: {
            status: "EXECUTED",
            executedAt: new Date(),
            externalId,
            errorMessage: null,
          },
        });

        if (updated.count !== 1) {
          throw new Error("Action execution state changed unexpectedly.");
        }

        await tx.auditLog.create({
          data: {
            action: "ACTION_EXECUTED",
            actor: actor.trim(),
            proposedActionId: id,
            details: {
              mode: dryRun ? "DRY_RUN" : "LIVE",
              externalCallMade: !dryRun,
              externalId,
              message: dryRun
                ? "Execution simulated; no external action was performed."
                : "Gmail accepted the message for sending.",
            },
          },
        });

        return tx.proposedAction.findUnique({ where: { id } });
      },
      { maxWait: 20000, timeout: 30000 }
    );

    return {
      action: result,
      dryRun,
      message: dryRun
        ? "Dry run completed. No external action was performed."
        : "Gmail accepted the email for sending.",
    };
  } catch (error) {
    // A live Gmail call may have succeeded even if a later database
    // operation failed. Do not mark it FAILED and invite a blind retry.
    const message = error instanceof Error
      ? error.message
      : String(error);

    const safeErrorMessage = !dryRun
      ? `Live execution outcome may be uncertain. Do not retry automatically. Details: ${message}`
      : message;

    try {
      await prisma.$transaction(
        async (tx) => {
          const updated = await tx.proposedAction.updateMany({
            where: { id, status: "EXECUTING" },
            data: {
              // Keep live failures in EXECUTING for manual investigation.
              status: dryRun ? "FAILED" : "EXECUTING",
              errorMessage: safeErrorMessage,
            },
          });

          if (updated.count === 1) {
            await tx.auditLog.create({
              data: {
                action: "ACTION_EXECUTION_FAILED",
                actor: actor.trim(),
                proposedActionId: id,
                details: {
                  mode: dryRun ? "DRY_RUN" : "LIVE",
                  outcomeUncertain: !dryRun,
                  error: safeErrorMessage,
                },
              },
            });
          }
        },
        { maxWait: 20000, timeout: 30000 }
      );
    } catch (loggingError) {
      console.error(
        "Failed to persist action execution error:",
        loggingError instanceof Error
          ? loggingError.message
          : String(loggingError)
      );
    }

    throw error;
  }
}
