
import dotenv from "dotenv";
dotenv.config();

const {
  getHubSpotDealRelationships,
  getHubSpotDeals,
} = await import("./src/services/hubspotService.js");

try {
  const deals = await getHubSpotDeals(3);

  for (const deal of deals) {
    const result = await getHubSpotDealRelationships(deal);

    console.log("\nDeal:", deal.properties?.dealname ?? deal.id);
    console.log("Deal ID:", deal.id);
    console.dir(
      {
        company: result.company,
        contacts: result.contacts,
        associationErrors: result.associationErrors,
      },
      { depth: 5 }
    );
  }
} catch (error) {
  console.error("Association test failed:", error.message);
  process.exitCode = 1;
}
