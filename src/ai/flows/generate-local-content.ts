'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating hyper-local content in a teacher's local language based on a simple prompt.
 *
 * - generateLocalContent - A function that triggers the content generation flow.
 * - GenerateLocalContentInput - The input type for the generateLocalContent function.
 * - GenerateLocalContentOutput - The return type for the generateLocalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalContentInputSchema = z.object({
  prompt: z.string().describe('A simple prompt for generating local content.'),
  language: z.string().describe('The target language for the content generation.'),
});
export type GenerateLocalContentInput = z.infer<typeof GenerateLocalContentInputSchema>;

const GenerateLocalContentOutputSchema = z.object({
  content: z.string().describe('The generated content in the specified language.'),
});
export type GenerateLocalContentOutput = z.infer<typeof GenerateLocalContentOutputSchema>;

export async function generateLocalContent(input: GenerateLocalContentInput): Promise<GenerateLocalContentOutput> {
  return generateLocalContentFlow(input);
}

const generateLocalContentPrompt = ai.definePrompt({
  name: 'generateLocalContentPrompt',
  input: {schema: GenerateLocalContentInputSchema},
  output: {schema: GenerateLocalContentOutputSchema},
  prompt: `You are an expert in generating hyper-local content for teachers. Please generate content in the following language: {{{language}}}.  The content should be based on the following prompt: {{{prompt}}}.`,
});

const generateLocalContentFlow = ai.defineFlow(
  {
    name: 'generateLocalContentFlow',
    inputSchema: GenerateLocalContentInputSchema,
    outputSchema: GenerateLocalContentOutputSchema,
  },
  async input => {
    const {output} = await generateLocalContentPrompt(input);
    return output!;
  }
);
