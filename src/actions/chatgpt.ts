"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export const generateCreativePrompt = async (userPrompt: string) => {
  const finalPrompt = `
Create a coherent and relevant outline for the following prompt: ${userPrompt}.
The outline should consist of at least 6 points, with each point written as a single sentence.
Ensure the outline is well-structured and directly related to the topic.

Return ONLY the output in this exact plain JSON format — no explanation, no markdown:
{
  "outlines": [
    "Point 1",
    "Point 2",
    "Point 3",
    "Point 4",
    "Point 5",
    "Point 6"
  ]
}
Do NOT wrap the response in triple backticks or markdown formatting. Return ONLY valid JSON.
`;

  try {
    const result = await generateText({
      model: googleAI("models/gemini-1.5-flash"),
      prompt: finalPrompt,
    });

    const rawOutput = result.text.trim();
    console.log("🧾 Raw Gemini Output:", rawOutput);

    // Sanitize and extract valid JSON from possible markdown wrappers
    const cleanedOutput = rawOutput
      .replace(/```json|```/g, "") // Remove markdown code fences
      .trim();

    // Fallback: extract JSON body just in case extra stuff is still there
    const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response.");
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    return { status: 200, data: jsonResponse };

  } catch (error) {
    console.error("❌ Failed to parse Gemini response:", error);
    return { status: 500, error: "Failed to generate valid JSON from AI." };
  }
};
