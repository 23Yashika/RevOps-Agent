
import prisma from "../config/database.js";

export async function createAuditLog({
  action,
  actor,
  details = {},
  proposedActionId = null,
}) {
  if (!action || !actor) {
    throw new Error("Both action and actor are required.");
  }

  return prisma.auditLog.create({
    data: {
      action,
      actor,
      details,
      ...(proposedActionId ? { proposedActionId } : {}),
    },
  });
}

export async function getAuditLogs({
  proposedActionId,
  limit = 50,
} = {}) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  return prisma.auditLog.findMany({
    where: proposedActionId ? { proposedActionId } : {},
    orderBy: {
      createdAt: "desc",
    },
    take: safeLimit,
  });
}
