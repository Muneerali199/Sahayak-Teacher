'use server';

/**
 * @fileOverview Provides simple, accurate explanations for complex student questions in the local language, complete with easy-to-understand analogies.
 *
 * - explainConcept - A function that explains a concept.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z
  .object({
    question: z.string().optional().describe('The complex question from the student as text.'),
    audioQuestionDataUri: z
      .string()
      .optional()
      .describe(
        "The student's question as an audio data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    localLanguage: z.string().describe('The local language of the explanation.'),
  })
  .refine(data => data.question || data.audioQuestionDataUri, {
    message: 'Either a text question or an audio recording must be provided.',
  });
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A simple, accurate explanation in the local language, complete with easy-to-understand analogies.'
    ),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are an expert teacher specializing in explaining complex concepts to students in simple terms. You will provide accurate explanations in the local language, complete with easy-to-understand analogies.

  {{#if audioQuestionDataUri}}
  The student's question is in the following audio. The audio can be in any language, including Hindi. Please transcribe the question accurately, and then provide your explanation.
  Audio: {{media url=audioQuestionDataUri}}
  {{else}}
  The student's question is: "{{{question}}}"
  {{/if}}

  Please provide your explanation in {{{localLanguage}}}.`,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
