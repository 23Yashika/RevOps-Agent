
import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

try {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: 'Return JSON only: {"status":"working"}',
      },
    ],
    response_format: { type: "json_object" },
  });

  console.log("Groq response:", response.choices[0].message.content);
} catch (error) {
  console.error("Groq test failed:", error.status, error.message);
}
