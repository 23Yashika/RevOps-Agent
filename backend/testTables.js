
import "dotenv/config";
import prisma from "./src/config/database.js";

async function testTables() {
  try {
    await prisma.$connect();

    const analysisRuns = await prisma.analysisRun.count();
    const proposedActions = await prisma.proposedAction.count();
    const auditLogs = await prisma.auditLog.count();

    console.log("Database tables verified successfully!");
    console.log("AnalysisRun records:", analysisRuns);
    console.log("ProposedAction records:", proposedActions);
    console.log("AuditLog records:", auditLogs);
  } catch (error) {
    console.error("Table verification failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await testTables();
