// src/app/actions.ts
"use server";

import { generateKeywordCluster, type GenerateKeywordClusterInput, type GenerateKeywordClusterOutput } from "@/ai/flows/generate-keyword-cluster";
import { z } from "zod";

const ContentTypeEnum = z.enum(['article', 'internal page', 'landing page']);

// El esquema de entrada para la acción ahora coincide con GenerateKeywordClusterInput
// que ya incluye 'country'.
const ActionInputSchema = z.object({
  seedKeyword: z.string().min(1, "La palabra clave raíz es requerida."),
  contentType: ContentTypeEnum,
  websiteType: z.string().min(1, "El tipo de sitio web es requerido."),
  country: z.string().min(2, "El país es requerido. Puede ser un código de país o 'Global'.").or(z.literal("global")),
});


export async function generateKeywordsAction(
  data: GenerateKeywordClusterInput // La entrada ya es del tipo correcto
): Promise<{ success: true; data: GenerateKeywordClusterOutput } | { success: false; error: string }> {
  try {
    // Validamos los datos usando el schema de la acción, que debe ser compatible
    // con GenerateKeywordClusterInput.
    const validatedData = ActionInputSchema.parse(data);
    const result = await generateKeywordCluster(validatedData);
    
    // El flujo de Genkit ahora se encarga de manejar si output es null o no.
    // Si el flujo se resuelve, asumimos que el resultado es válido según su esquema.
    return { success: true, data: result };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(", ") };
    }
    console.error("Error generating keyword cluster:", error);
    // Si el error proviene del flujo de Genkit por falta de resultado, lo atrapamos aquí.
    if (error instanceof Error && error.message === "El modelo de IA no devolvió un resultado.") {
        return { success: false, error: "Error al generar palabras clave: El modelo de IA no devolvió un resultado completo o válido." };
    }
    return { success: false, error: "Ocurrió un error inesperado al generar palabras clave." };
  }
}
