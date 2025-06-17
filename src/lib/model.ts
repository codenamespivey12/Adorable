import { openai } from "@ai-sdk/openai";

export const OPENAI_MODEL = openai("o4-mini", { reasoningEffort: "high" });
