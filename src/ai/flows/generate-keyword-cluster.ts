// src/ai/flows/generate-keyword-cluster.ts
'use server';
/**
 * @fileOverview Generates a keyword cluster based on a seed keyword, content type, and website type.
 *
 * - generateKeywordCluster - A function that generates a keyword cluster.
 * - GenerateKeywordClusterInput - The input type for the generateKeywordCluster function.
 * - GenerateKeywordClusterOutput - The return type for the generateKeywordCluster function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeywordClusterInputSchema = z.object({
  seedKeyword: z.string().describe('The seed keyword to generate a cluster for.'),
  contentType: z.enum(['article', 'internal page', 'landing page']).describe('The type of content to generate keywords for.'),
  websiteType: z.string().describe('The type or niche of the website (e.g., e-commerce, blog, SaaS).'),
});

export type GenerateKeywordClusterInput = z.infer<typeof GenerateKeywordClusterInputSchema>;

const KeywordInfoSchema = z.object({
  keyword: z.string().describe('The keyword itself.'),
  searchVolume: z.number().describe('The estimated monthly search volume for the keyword.'),
  rankingDifficulty: z.number().describe('A score indicating the difficulty of ranking for this keyword (0-100).'),
});

const GenerateKeywordClusterOutputSchema = z.object({
  relatedKeywords: z.array(KeywordInfoSchema).describe('Keywords closely related to the seed keyword.'),
  semanticKeywords: z.array(KeywordInfoSchema).describe('Keywords with similar meaning to the seed keyword.'),
  phraseMatchKeywords: z.array(KeywordInfoSchema).describe('Keywords that include the seed keyword as part of a phrase.'),
});

export type GenerateKeywordClusterOutput = z.infer<typeof GenerateKeywordClusterOutputSchema>;

export async function generateKeywordCluster(input: GenerateKeywordClusterInput): Promise<GenerateKeywordClusterOutput> {
  return generateKeywordClusterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeywordClusterPrompt',
  input: {schema: GenerateKeywordClusterInputSchema},
  output: {schema: GenerateKeywordClusterOutputSchema},
  prompt: `You are an expert SEO specialist. Generate a cluster of keywords based on the following information:

Seed Keyword: {{{seedKeyword}}}
Content Type: {{{contentType}}}
Website Type: {{{websiteType}}}

Consider the content type and website type when generating the keyword cluster. Focus on keywords that are relevant and have a good balance of search volume and ranking difficulty.

Output the keyword cluster in the following JSON format:

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
