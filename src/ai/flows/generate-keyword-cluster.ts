// src/ai/flows/generate-keyword-cluster.ts
'use server';
/**
 * @fileOverview Genera un grupo de palabras clave basado en una palabra clave raíz, tipo de contenido, tipo de sitio web y país.
 * Utiliza herramientas para obtener métricas SEO y tendencias.
 *
 * - generateKeywordCluster - Una función que genera un grupo de palabras clave.
 * - GenerateKeywordClusterInput - El tipo de entrada para la función generateKeywordCluster.
 * - GenerateKeywordClusterOutput - El tipo de retorno para la función generateKeywordCluster.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  fetchKeywordMetrics,
  fetchKeywordTrend,
  type KeywordMetrics,
  type KeywordTrend,
} from '@/services/seo-tools';

const GenerateKeywordClusterInputSchema = z.object({
  seedKeyword: z.string().describe('La palabra clave raíz para generar un grupo.'),
  contentType: z.enum(['article', 'internal page', 'landing page']).describe('El tipo de contenido para el cual generar palabras clave.'),
  websiteType: z.string().describe('El tipo o nicho del sitio web (ej., e-commerce, blog, SaaS).'),
  country: z.string().describe('El código del país (ej. ES, MX, US) o "Global" para el análisis de palabras clave. Este país se usa para obtener el volumen de búsqueda, la dificultad de clasificación y la tendencia.'),
});

export type GenerateKeywordClusterInput = z.infer<typeof GenerateKeywordClusterInputSchema>;

const KeywordInfoSchema = z.object({
  keyword: z.string().describe('La palabra clave en sí.'),
  searchVolume: z
    .number()
    .describe('El volumen de búsqueda mensual estimado para la palabra clave, obtenido mediante la herramienta de métricas.'),
  rankingDifficulty: z
    .number()
    .describe('Una puntuación que indica la dificultad de clasificar para esta palabra clave (0-100), obtenida mediante la herramienta de métricas.'),
  trendScore: z
    .number()
    .optional()
    .describe('Una puntuación de tendencia (0-100) para la palabra clave, obtenida mediante la herramienta de tendencias, si está disponible.'),
});
export type KeywordInfo = z.infer<typeof KeywordInfoSchema>;

const GenerateKeywordClusterOutputSchema = z.object({
  relatedKeywords: z.array(KeywordInfoSchema).describe('Palabras clave estrechamente relacionadas con la palabra clave raíz.'),
  semanticKeywords: z.array(KeywordInfoSchema).describe('Palabras clave con significado similar a la palabra clave raíz.'),
  phraseMatchKeywords: z.array(KeywordInfoSchema).describe('Palabras clave que incluyen la palabra clave raíz como parte de una frase.'),
});

export type GenerateKeywordClusterOutput = z.infer<typeof GenerateKeywordClusterOutputSchema>;

// Herramienta Genkit para obtener métricas SEO
const getKeywordMetricsTool = ai.defineTool(
  {
    name: 'getKeywordMetrics',
    description: 'Obtiene el volumen de búsqueda y la dificultad de posicionamiento para una palabra clave en un país específico.',
    inputSchema: z.object({
      keyword: z.string().describe('La palabra clave para la cual obtener métricas.'),
      countryCode: z.string().describe('El código de país de dos letras (ISO 3166-1 alpha-2) para el análisis.'),
    }),
    outputSchema: z.custom<KeywordMetrics | null>(),
  },
  async ({keyword, countryCode}) => {
    return await fetchKeywordMetrics(keyword, countryCode);
  }
);

// Herramienta Genkit para obtener tendencias de palabras clave
const getKeywordTrendTool = ai.defineTool(
  {
    name: 'getKeywordTrend',
    description: 'Obtiene la puntuación de tendencia para una palabra clave en un país específico.',
    inputSchema: z.object({
      keyword: z.string().describe('La palabra clave para la cual obtener la tendencia.'),
      countryCode: z.string().describe('El código de país de dos letras (ISO 3166-1 alpha-2) para el análisis.'),
    }),
    outputSchema: z.custom<KeywordTrend | null>(),
  },
  async ({keyword, countryCode}) => {
    return await fetchKeywordTrend(keyword, countryCode);
  }
);

export async function generateKeywordCluster(input: GenerateKeywordClusterInput): Promise<GenerateKeywordClusterOutput> {
  return generateKeywordClusterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeywordClusterPrompt',
  input: {schema: GenerateKeywordClusterInputSchema},
  output: {schema: GenerateKeywordClusterOutputSchema},
  tools: [getKeywordMetricsTool, getKeywordTrendTool],
  prompt: `Eres un especialista SEO experto. Tu tarea es generar un grupo de palabras clave basándote en la siguiente información:

Palabra Clave Raíz: {{{seedKeyword}}}
Tipo de Contenido: {{{contentType}}}
Tipo de Sitio Web: {{{websiteType}}}
País para análisis SEO: {{{country}}}

Instrucciones:
1. Identifica tres categorías de palabras clave: 'Palabras Clave Relacionadas', 'Palabras Clave Semánticas' y 'Palabras Clave de Concordancia de Frase'.
2. Para cada categoría, genera una lista de **aproximadamente 10** palabras clave relevantes. Si no encuentras 10 buenas opciones, genera tantas como consideres de alta calidad.
3. Para CADA palabra clave generada:
    a. Utiliza la herramienta 'getKeywordMetrics' para obtener su volumen de búsqueda mensual y dificultad de posicionamiento para el país '{{{country}}}'. Si la herramienta no devuelve datos para una palabra clave, puedes estimar estos valores basándote en tu conocimiento, pero prioriza el uso de la herramienta. Si estimas, indica que son estimaciones.
    b. Utiliza la herramienta 'getKeywordTrend' para obtener su puntuación de tendencia (0-100) para el país '{{{country}}}'. Si la herramienta no devuelve datos, el campo 'trendScore' puede omitirse para esa palabra clave.
4. NO incluyas el nombre del país en las palabras clave generadas. El país solo se usa para las herramientas.
5. Enfócate en palabras clave que sean relevantes y tengan un buen equilibrio entre volumen de búsqueda y dificultad de clasificación para el país especificado.

Devuelve el grupo de palabras clave en el siguiente formato JSON. Asegúrate de que cada palabra clave en las listas tenga los campos 'keyword', 'searchVolume', 'rankingDifficulty' y opcionalmente 'trendScore':

{{outputSchema}}`,
});

const generateKeywordClusterFlow = ai.defineFlow(
  {
    name: 'generateKeywordClusterFlow',
    inputSchema: GenerateKeywordClusterInputSchema,
    outputSchema: GenerateKeywordClusterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("El modelo de IA no devolvió un resultado.");
    }
    // Asegurarse de que los números sean números y no strings accidentalmente
    const ensureNumbers = (kw: KeywordInfo) => ({
      ...kw,
      searchVolume: Number(kw.searchVolume) || 0,
      rankingDifficulty: Number(kw.rankingDifficulty) || 0,
      trendScore: kw.trendScore !== undefined ? Number(kw.trendScore) : undefined,
    });

    return {
      relatedKeywords: output.relatedKeywords.map(ensureNumbers),
      semanticKeywords: output.semanticKeywords.map(ensureNumbers),
      phraseMatchKeywords: output.phraseMatchKeywords.map(ensureNumbers),
    };
  }
);
