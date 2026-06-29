import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createDeepSeekProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "deepseek",
    baseURL: "https://api.deepseek.com/v1",
    apiKey,
  });
}

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export function getAiModel() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    const provider = createDeepSeekProvider(deepseekKey);
    return provider("deepseek-chat");
  }
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const provider = createLovableAiGatewayProvider(lovableKey);
    return provider("google/gemini-3-flash-preview");
  }
  throw new Error("AI is unavailable (missing API key).");
}
