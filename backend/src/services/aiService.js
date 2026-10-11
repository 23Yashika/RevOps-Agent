import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function parseInsights(content) {
  const insights = JSON.parse(content);

  if (
    typeof insights.riskExplanation !== "string" ||
    !Array.isArray(insights.keyFindings) ||
    typeof insights.nextBestAction !== "string" ||
    typeof insights.followUpEmail?.subject !== "string" ||
    typeof insights.followUpEmail?.body !== "string"
  ) {
    throw new Error("AI response does not match the expected schema.");
  }

  return insights;
}

export async function generateDealInsights(deal) {
  const evidence = {
    dealName: deal.dealName,
    company: deal.company,
    stage: deal.stage,
    amount: deal.amount,
    closeDate: deal.closeDate,
    riskScore: deal.riskScore,
    riskLevel: deal.riskLevel,
    evidence: (deal.evidence ?? []).slice(0, 6),
    recommendations: (deal.recommendations ?? []).slice(0, 3),
    emails: (deal.matchedEmails ?? []).slice(0, 3).map((email) => ({
      subject: email.subject,
      snippet: email.snippet,
      date: email.date,
      demo: email.demo === true,
    })),
    meetings: (deal.matchedEvents ?? []).slice(0, 3).map((event) => ({
      summary: event.summary,
      start: event.start,
      description: event.description,
      demo: event.demo === true,
    })),
  };

  const messages = [
    {
      role: "system",
      content: [
        "You are a B2B Revenue Operations assistant.",
        "Analyze the deal evidence supplied by the user.",
        "Return a single JSON object with these exact keys:",
        "riskExplanation (string), keyFindings (array of strings),",
        "nextBestAction (string), followUpEmail (object containing subject and body strings).",
        "Do not include Markdown or text outside the JSON.",
        "Use only facts in the evidence. Do not invent interactions or outcomes.",
        "Treat demo=true records as simulated evidence.",
        "If information is missing, say so.",
        "The email is a draft only; do not claim it was sent.",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify(evidence),
    },
  ];

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    temperature: 0,
    max_tokens: 900,
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
}