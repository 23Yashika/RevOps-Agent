
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function executeHubSpotTool(toolName, arguments_) {
  const session = await composio.create("revops-demo-user", {
    toolkits: ["hubspot"],
  });

  const result = await session.execute(toolName, arguments_);

  if (result.error) {
    console.error("Composio returned this error:");
    console.dir(result, { depth: 10, colors: true });

    throw new Error(
      `HubSpot tool ${toolName} failed: ${JSON.stringify(result.error)}`
    );
  }

  return result.data;
}

export async function getHubSpotCompanies(limit = 10) {
  const data = await executeHubSpotTool(
    "HUBSPOT_SEARCH_COMPANIES",
    {
      limit,
      properties: ["name", "domain", "website"],
    }
  );

  return data?.results ?? [];
}


export async function getHubSpotContacts(limit = 10) {
  const data = await executeHubSpotTool(
    "HUBSPOT_SEARCH_CONTACTS_BY_CRITERIA",
    {
      query: "a",
      limit,
      properties: [
        "firstname",
        "lastname",
        "email",
        "phone",
        "company",
      ],
    }
  );

  return data?.results ?? [];
}


export async function getHubSpotDeals(limit = 10) {
  const data = await executeHubSpotTool(
    "HUBSPOT_SEARCH_DEALS",
    {
      limit,
      properties: [
        "dealname",
        "dealstage",
        "amount",
        "closedate",
        "pipeline",
      ],
    }
  );

  return data?.results ?? [];
}

export async function getHubSpotObjectAssociations(
  objectType,
  objectId,
  toObjectType
) {
  const data = await executeHubSpotTool(
    "HUBSPOT_LIST_OBJECT_ASSOCIATIONS",
    {
      objectType,
      objectId: String(objectId),
      toObjectType,
      limit: 100,
    }
  );

  // Normalize common HubSpot/Composio response shapes.
  const results =
    data?.results ??
    data?.associations ??
    data?.data?.results ??
    [];

  return results
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      return item?.id ??
        item?.toObjectId ??
        item?.toObject?.id ??
        item?.objectId ??
        null;
    })
    .filter(Boolean)
    .map(String);
}

export async function getHubSpotObjectById(
  objectType,
  objectId,
  properties = []
) {
  const data = await executeHubSpotTool(
    "HUBSPOT_READ_CRM_OBJECT_BY_ID",
    {
      objectType,
      objectId: String(objectId),
      properties,
    }
  );

  return data?.result ?? data?.data ?? data ?? null;
}

export async function getHubSpotDealRelationships(deal) {
  const dealId = deal?.id;

  if (!dealId) {
    return {
      deal,
      company: null,
      contacts: [],
      associationErrors: [],
    };
  }

  const associationErrors = [];

  const [companyIds, contactIds] = await Promise.all([
    getHubSpotObjectAssociations("deals", dealId, "companies")
      .catch((error) => {
        associationErrors.push(`Company associations: ${error.message}`);
        return [];
      }),
    getHubSpotObjectAssociations("deals", dealId, "contacts")
      .catch((error) => {
        associationErrors.push(`Contact associations: ${error.message}`);
        return [];
      }),
  ]);

  const [companies, contacts] = await Promise.all([
    Promise.all(
      companyIds.map((id) =>
        getHubSpotObjectById("companies", id, [
          "name",
          "domain",
          "website",
        ]).catch((error) => {
          associationErrors.push(`Company ${id}: ${error.message}`);
          return null;
        })
      )
    ),
    Promise.all(
      contactIds.map((id) =>
        getHubSpotObjectById("contacts", id, [
          "firstname",
          "lastname",
          "email",
          "phone",
          "company",
        ]).catch((error) => {
          associationErrors.push(`Contact ${id}: ${error.message}`);
          return null;
        })
      )
    ),
  ]);

  return {
    deal,
    company: companies.find(Boolean) ?? null,
    contacts: contacts.filter(Boolean),
    associationErrors,
  };
}
