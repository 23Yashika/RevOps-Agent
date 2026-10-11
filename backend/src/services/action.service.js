
import prisma from "../config/database.js";

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
    });

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

  if (process.env.DRY_RUN !== "true") {
    throw new Error(
      "Real action executors are not configured yet. Set DRY_RUN=true for safe testing."
    );
  }

  // Atomically claim an approved action.
  const claimedAction = await prisma.$transaction(async (tx) => {
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

    const claimed = await tx.proposedAction.updateMany({
      where: {
        id,
        status: "APPROVED",
      },
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
          mode: "DRY_RUN",
          previousStatus: "APPROVED",
          newStatus: "EXECUTING",
        },
      },
    });

    return tx.proposedAction.findUnique({
      where: { id },
    });
  }, {
    maxWait: 20000,
    timeout: 30000,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.proposedAction.updateMany({
        where: {
          id: claimedAction.id,
          status: "EXECUTING",
        },
        data: {
          status: "EXECUTED",
          executedAt: new Date(),
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
            mode: "DRY_RUN",
            externalCallMade: false,
            message:
              "Execution simulated; no external action was performed.",
          },
        },
      });

      return tx.proposedAction.findUnique({
        where: { id },
      });
    }, {
      maxWait: 20000,
      timeout: 30000,
    });

    return {
      action: result,
      dryRun: true,
      message: "Dry run completed. No external action was performed.",
    };
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.proposedAction.updateMany({
        where: {
          id: claimedAction.id,
          status: "EXECUTING",
        },
        data: {
          status: "FAILED",
          errorMessage: error.message,
        },
      });

      if (updated.count === 1) {
        await tx.auditLog.create({
          data: {
            action: "ACTION_EXECUTION_FAILED",
            actor: actor.trim(),
            proposedActionId: id,
            details: {
              mode: "DRY_RUN",
              error: error.message,
            },
          },
        });
      }
    });

    throw error;
  }
}
