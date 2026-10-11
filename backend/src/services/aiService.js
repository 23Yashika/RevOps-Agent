
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 0, // Disable automatic SDK retries.
  timeout: 30000,
});

function parseInsights(content) {
  let insights;

  try {
    insights = JSON.parse(content);
  } catch {
    throw new Error("Groq returned invalid JSON.");
  }

  if (
    !insights ||
    typeof insights.riskExplanation !== "string" ||
    !Array.isArray(insights.keyFindings) ||
    !insights.keyFindings.every(
      (finding) => typeof finding === "string"
    ) ||
    typeof insights.nextBestAction !== "string" ||
    typeof insights.followUpEmail?.subject !== "string" ||
    typeof insights.followUpEmail?.body !== "string"
  ) {
    throw new Error(
      "Groq response does not match the expected JSON schema."
    );
  }

  return insights;
}

function buildEvidence(deal) {
  return {
    dealName: deal.dealName ?? "Unknown deal",
    company: deal.company ?? null,
    stage: deal.stage ?? null,
    amount: deal.amount ?? null,
    closeDate: deal.closeDate ?? null,
    riskScore: deal.riskScore ?? 0,
    riskLevel: deal.riskLevel ?? "unknown",
    evidence: (deal.evidence ?? []).slice(0, 5),
    recommendations: (deal.recommendations ?? []).slice(0, 2),

    emails: (deal.matchedEmails ?? []).slice(0, 2).map((email) => ({
      subject: email.subject ?? "",
      snippet: email.snippet ?? "",
      date: email.date ?? null,
      demo: email.demo === true,
    })),

    meetings: (deal.matchedEvents ?? []).slice(0, 2).map((event) => ({
      summary: event.summary ?? "",
      start: event.start ?? null,
      description: event.description ?? "",
      demo: event.demo === true,
    })),
  };
}

function buildMessages(evidence) {
  return [
    {
      role: "system",
      content: [
        "You are a B2B Revenue Operations assistant.",
        "Return exactly one valid JSON object.",
        "Required keys: riskExplanation, keyFindings, nextBestAction, followUpEmail.",
        "riskExplanation must be a string.",
        "keyFindings must be an array of strings.",
        "nextBestAction must be a string.",
        "followUpEmail must contain string fields subject and body.",
        "Return JSON only, without Markdown or code fences.",
        "Use only the supplied evidence. Never invent activity or outcomes.",
        "Treat demo=true records as simulated, not verified live activity.",
        "If evidence is missing, explicitly state that it is unavailable.",
        "Draft emails only. Never claim that an email has been sent.",
        "Keep every field concise.",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify(evidence),
    },
  ];
}

function isRateLimitError(error) {
  return (
    error?.status === 429 ||
    error?.code === "rate_limit_exceeded" ||
    error?.error?.code === "rate_limit_exceeded"
  );
}

export async function generateDealInsights(deal) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const evidence = buildEvidence(deal);
  const messages = buildMessages(evidence);
  const model =
    process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  try {
    const response = await groq.chat.completions.create({
      model,
      temperature: 0,
      max_completion_tokens: 800,
      response_format: { type: "json_object" },
      messages,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    const insights = parseInsights(content);

    return {
      riskExplanation: insights.riskExplanation,
      keyFindings: insights.keyFindings,
      nextBestAction: insights.nextBestAction,
      followUpEmail: {
        subject: insights.followUpEmail.subject,
        body: insights.followUpEmail.body,
      },
      generatedBy: "Groq",
      demoDataIncluded: [
        ...(deal.matchedEmails ?? []),
        ...(deal.matchedEvents ?? []),
      ].some((item) => item.demo === true),
    };
  } catch (error) {
    if (isRateLimitError(error)) {
      throw new Error(
        "Groq rate limit reached. CRM risk scoring and recommendations remain available, but AI insights are temporarily unavailable. Try again after the limit resets."
      );
    }

    console.error(
      `Groq insight generation failed for deal ${deal.dealId}:`,
      error.message
    );

    throw new Error(
      `Could not generate AI insights: ${error.message}`
    );
  }
}
