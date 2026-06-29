// AI-powered server functions: paragraph generation, weakness analysis,
// daily challenge, vocabulary & grammar practice. Uses Lovable AI Gateway.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { getAiModel } from "./ai-gateway.server";

async function callAI(system: string, prompt: string, maxTokens = 600): Promise<string> {
  const model = getAiModel();
  const { text } = await generateText({
    model,
    system,
    prompt,
    maxOutputTokens: maxTokens,
  });
  return text.trim();
}

// ---------- AI paragraph generator ----------
export const generateParagraph = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        language: z.string().default("english"),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        topic: z.string().max(80).optional(),
        words: z.number().int().min(20).max(200).default(60),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sys =
      "You write short, natural typing-practice paragraphs. Output ONLY the paragraph text — no titles, no quotes, no explanations, no markdown.";
    const prompt = `Write a single ${data.difficulty} difficulty paragraph in ${data.language} of about ${data.words} words${data.topic ? ` about "${data.topic}"` : ""}. Use natural prose. Avoid emojis and special unicode punctuation.`;
    const text = await callAI(sys, prompt, 500);
    return { text: text.replace(/^["'`\s]+|["'`\s]+$/g, "") };
  });

// ---------- AI weakness analysis + coach ----------
export const analyzeWeakness = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        wpm: z.number(),
        accuracy: z.number(),
        consistency: z.number(),
        topMistakes: z.array(z.tuple([z.string(), z.number()])).max(15),
        durationSeconds: z.number(),
        language: z.string().default("english"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sys = "You are an expert typing coach. Reply in JSON only.";
    const prompt = `Analyse this typing run and produce coaching advice.
Stats:
- WPM: ${data.wpm}
- Accuracy: ${data.accuracy}%
- Consistency: ${data.consistency}%
- Duration: ${data.durationSeconds.toFixed(1)}s
- Language: ${data.language}
- Most-mistaken characters (char,count): ${data.topMistakes.map(([c, n]) => `${c}:${n}`).join(", ") || "none"}

Return strict JSON with this shape:
{
  "verdict": "one short sentence",
  "weaknesses": ["short bullet", "short bullet", "short bullet"],
  "drill": "one specific 1–2 sentence drill the user should run next",
  "nextDifficulty": "easy" | "medium" | "hard"
}`;
    const text = await callAI(sys, prompt, 500);
    // Extract JSON
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
      return {
        verdict: text.slice(0, 140),
        weaknesses: [],
        drill: "",
        nextDifficulty: "medium" as const,
      };
    try {
      const parsed = JSON.parse(match[0]);
      return {
        verdict: String(parsed.verdict ?? "").slice(0, 240),
        weaknesses: Array.isArray(parsed.weaknesses)
          ? parsed.weaknesses.slice(0, 5).map((s: unknown) => String(s).slice(0, 160))
          : [],
        drill: String(parsed.drill ?? "").slice(0, 320),
        nextDifficulty: (["easy", "medium", "hard"].includes(parsed.nextDifficulty)
          ? parsed.nextDifficulty
          : "medium") as "easy" | "medium" | "hard",
      };
    } catch {
      return {
        verdict: "Could not parse AI response",
        weaknesses: [],
        drill: "",
        nextDifficulty: "medium" as const,
      };
    }
  });

// ---------- Daily AI challenge ----------
export const dailyChallenge = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ language: z.string().default("english") }).parse(d))
  .handler(async ({ data }) => {
    const today = new Date().toISOString().slice(0, 10);
    const sys = "Generate a single typing-practice paragraph. Output ONLY plain text.";
    const prompt = `Today is ${today}. Write a 45-word typing challenge in ${data.language} on an interesting non-political topic. Plain prose, no markdown.`;
    const text = await callAI(sys, prompt, 320);
    return { date: today, text: text.replace(/^["'`\s]+|["'`\s]+$/g, "") };
  });

// ---------- Grammar practice ----------
export const grammarPractice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        language: z.string().default("english"),
        level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sys = "Output ONLY the practice paragraph. No headings, no explanations.";
    const prompt = `Write 50 words of grammatically rich ${data.level} ${data.language} practice text using a mix of clauses, conjunctions, and punctuation.`;
    const text = await callAI(sys, prompt, 320);
    return { text: text.replace(/^["'`\s]+|["'`\s]+$/g, "") };
  });

// ---------- Vocabulary practice ----------
export const vocabPractice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        language: z.string().default("english"),
        theme: z.string().max(60).default("everyday life"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sys =
      "Output ONLY a space-separated list of vocabulary words — no commas, numbers, or explanations.";
    const prompt = `Give 40 useful ${data.language} vocabulary words on the theme "${data.theme}", separated by single spaces.`;
    const text = await callAI(sys, prompt, 260);
    const cleaned = text
      .replace(/[\d.,;:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { text: cleaned };
  });
