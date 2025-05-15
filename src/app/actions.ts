// src/app/actions.ts
"use server";

import { generateKeywordCluster, type GenerateKeywordClusterInput, type GenerateKeywordClusterOutput } from "@/ai/flows/generate-keyword-cluster";
import { z } from "zod";

const ContentTypeEnum = z.enum(['article', 'internal page', 'landing page']);

const ActionInputSchema = z.object({
  seedKeyword: z.string().min(1, "La palabra clave raíz es requerida."),
  contentType: ContentTypeEnum,
  websiteType: z.string().min(1, "El tipo de sitio web es requerido."),
  country: z.string().min(2, "El país es requerido."),
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
      return { success: false, error: "Error al generar palabras clave. El modelo de IA no devolvió un resultado." };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(", ") };
    }
    console.error("Error generating keyword cluster:", error);
    return { success: false, error: "Ocurrió un error inesperado al generar palabras clave." };
  }
}
