
import "dotenv/config";
import prisma from "./src/config/database.js";
import { createAuditLog, getAuditLogs } from "./src/services/audit.service.js";

async function testAuditService() {
  try {
    const entry = await createAuditLog({
      action: "DATABASE_TEST",
      actor: "system",
      details: {
        message: "Audit service verification",
        source: "testAudit.js",
      },
    });

    console.log("Audit entry created:", entry.id);

    const logs = await getAuditLogs({ limit: 5 });
    console.log("Recent audit entries:", logs.length);
    console.log("Latest event:", logs[0]?.action);
  } catch (error) {
    console.error("Audit test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await testAuditService();
