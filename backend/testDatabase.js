
import "dotenv/config";
import prisma from "./src/config/database.js";

async function testDatabase() {
  try {
    console.log("Checking environment configuration...");

    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is missing from backend/.env"
      );
    }

    console.log("DATABASE_URL loaded successfully.");
    console.log("Connecting to Neon PostgreSQL...");

    await prisma.$connect();

    console.log("✅ Prisma connected to Neon!");

    const result = await prisma.$queryRaw`
      SELECT NOW() AS current_time,
             current_database() AS database_name
    `;

    console.log("✅ Database query successful!");
    console.log("Database details:", result);
  } catch (error) {
    console.error("❌ Database test failed!");
    console.error("Message:", error.message);
    console.error("Error code:", error.code ?? "N/A");

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

await testDatabase();
