// src/ai/flows/generate-keyword-cluster.ts
'use server';
/**
 * @fileOverview Genera un grupo de palabras clave basado en una palabra clave raíz, tipo de contenido, tipo de sitio web y país.
 *
 * - generateKeywordCluster - Una función que genera un grupo de palabras clave.
 * - GenerateKeywordClusterInput - El tipo de entrada para la función generateKeywordCluster.
 * - GenerateKeywordClusterOutput - El tipo de retorno para la función generateKeywordCluster.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeywordClusterInputSchema = z.object({
  seedKeyword: z.string().describe('La palabra clave raíz para generar un grupo.'),
  contentType: z.enum(['article', 'internal page', 'landing page']).describe('El tipo de contenido para el cual generar palabras clave.'),
  websiteType: z.string().describe('El tipo o nicho del sitio web (ej., e-commerce, blog, SaaS).'),
  country: z.string().describe('El código del país (ej. ES, MX, US) o "Global" para el análisis de palabras clave. Este país se usa para estimar el volumen de búsqueda y la dificultad de clasificación.'),
});

export type GenerateKeywordClusterInput = z.infer<typeof GenerateKeywordClusterInputSchema>;

const KeywordInfoSchema = z.object({
  keyword: z.string().describe('La palabra clave en sí.'),
  searchVolume: z.number().describe('El volumen de búsqueda mensual estimado para la palabra clave, considerando el país especificado.'),
  rankingDifficulty: z.number().describe('Una puntuación que indica la dificultad de clasificar para esta palabra clave (0-100), considerando el país especificado.'),
});

const GenerateKeywordClusterOutputSchema = z.object({
  relatedKeywords: z.array(KeywordInfoSchema).describe('Palabras clave estrechamente relacionadas con la palabra clave raíz.'),
  semanticKeywords: z.array(KeywordInfoSchema).describe('Palabras clave con significado similar a la palabra clave raíz.'),
  phraseMatchKeywords: z.array(KeywordInfoSchema).describe('Palabras clave que incluyen la palabra clave raíz como parte de una frase.'),
});

export type GenerateKeywordClusterOutput = z.infer<typeof GenerateKeywordClusterOutputSchema>;

export async function generateKeywordCluster(input: GenerateKeywordClusterInput): Promise<GenerateKeywordClusterOutput> {
  return generateKeywordClusterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeywordClusterPrompt',
  input: {schema: GenerateKeywordClusterInputSchema},
  output: {schema: GenerateKeywordClusterOutputSchema},
  prompt: `Eres un especialista SEO experto. Genera un grupo de palabras clave basándote en la siguiente información:

Palabra Clave Raíz: {{{seedKeyword}}}
Tipo de Contenido: {{{contentType}}}
Tipo de Sitio Web: {{{websiteType}}}
País para análisis SEO: {{{country}}}

Considera el tipo de contenido, el tipo de sitio web y el país al generar el grupo de palabras clave. El país proporcionado ("{{{country}}}") debe usarse para refinar las estimaciones de volumen de búsqueda y dificultad de clasificación. NO incluyas el nombre del país en las palabras clave generadas.
Enfócate en palabras clave que sean relevantes y tengan un buen equilibrio entre volumen de búsqueda y dificultad de clasificación para el país especificado.

Devuelve el grupo de palabras clave en el siguiente formato JSON:

{{outputSchema}}`,
});

const generateKeywordClusterFlow = ai.defineFlow(
  {
    name: 'generateKeywordClusterFlow',
    inputSchema: GenerateKeywordClusterInputSchema,
    outputSchema: GenerateKeywordClusterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
