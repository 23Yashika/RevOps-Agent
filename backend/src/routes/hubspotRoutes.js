
import express from "express";

import {
  getHubSpotCompanies,
  getHubSpotContacts,
  getHubSpotDeals,
} from "../services/hubspotService.js";

const router = express.Router();

function getLimit(value) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) return 10;

  return Math.min(Math.max(parsed, 1), 100);
}

function handleError(res, error, resource) {
  console.error(`HubSpot ${resource} error:`, error);

  return res.status(500).json({
    success: false,
    message: `Failed to fetch HubSpot ${resource}`,
  });
}

router.get("/companies", async (req, res) => {
  try {
    const data = await getHubSpotCompanies(getLimit(req.query.limit));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    handleError(res, error, "companies");
  }
});

router.get("/contacts", async (req, res) => {
  try {
    const data = await getHubSpotContacts(getLimit(req.query.limit));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    handleError(res, error, "contacts");
  }
});

router.get("/deals", async (req, res) => {
  try {
    const data = await getHubSpotDeals(getLimit(req.query.limit));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    handleError(res, error, "deals");
  }
});

export default router;
