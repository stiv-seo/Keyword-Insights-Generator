// src/app/actions.ts
"use server";

import { generateKeywordCluster, type GenerateKeywordClusterInput, type GenerateKeywordClusterOutput } from "@/ai/flows/generate-keyword-cluster";
import { z } from "zod";

const ContentTypeEnum = z.enum(['article', 'internal page', 'landing page']);

const ActionInputSchema = z.object({
  seedKeyword: z.string().min(1, "Seed keyword is required."),
  contentType: ContentTypeEnum,
  websiteType: z.string().min(1, "Website type is required."),
});

export async function generateKeywordsAction(
  data: GenerateKeywordClusterInput
): Promise<{ success: true; data: GenerateKeywordClusterOutput } | { success: false; error: string }> {
  try {
    const validatedData = ActionInputSchema.parse(data);
    const result = await generateKeywordCluster(validatedData);
    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false, error: "Failed to generate keywords. The AI model did not return a result." };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(", ") };
    }
    console.error("Error generating keyword cluster:", error);
    return { success: false, error: "An unexpected error occurred while generating keywords." };
  }
}
