
import "dotenv/config";
import prisma from "./src/config/database.js";
import {
  createProposedAction,
  getProposedActions,
  approveProposedAction,
  rejectProposedAction,
} from "./src/services/action.service.js";

async function testActions() {
  let actionId;

  try {
    const action = await createProposedAction({
      accountName: "Test Account",
      type: "NOTIFY_OWNER",
      payload: {
        message: "Follow up with the account owner.",
      },
      rationale: "Testing the RevOps approval workflow.",
      evidenceIds: [],
      actor: "test-user",
    });

    actionId = action.id;
    console.log("Action created:", action.id, action.status);

    const pending = await getProposedActions({ status: "PENDING" });
    console.log("Pending actions:", pending.length);

    const approved = await approveProposedAction({
      id: action.id,
      actor: "test-reviewer",
      note: "Approved for workflow testing.",
    });

    console.log("Action reviewed:", approved.status);

    const logs = await prisma.auditLog.findMany({
      where: { proposedActionId: action.id },
      orderBy: { createdAt: "asc" },
    });

    console.log("Audit events:", logs.map((log) => log.action));
  } catch (error) {
    console.error("Action test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await testActions();
