'use server';

/**
 * @fileOverview Differentiated Material Creation AI agent.
 *
 * - createDifferentiatedMaterials - A function that handles the differentiated material creation process.
 * - CreateDifferentiatedMaterialsInput - The input type for the createDifferentiatedMaterials function.
 * - CreateDifferentiatedMaterialsOutput - The return type for the createDifferentiatedMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateDifferentiatedMaterialsInputSchema = z.object({
  textbookPagePhotoDataUri: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  gradeLevels: z
    .string()
    .describe('The grade levels for which to tailor the worksheet.  Example:  1st, 2nd, and 3rd'),
});
export type CreateDifferentiatedMaterialsInput = z.infer<
  typeof CreateDifferentiatedMaterialsInputSchema
>;

const CreateDifferentiatedMaterialsOutputSchema = z.object({
  worksheetVersions: z
    .array(z.string())
    .describe('Multiple versions of a worksheet tailored to different grade levels.'),
});
export type CreateDifferentiatedMaterialsOutput = z.infer<
  typeof CreateDifferentiatedMaterialsOutputSchema
>;

export async function createDifferentiatedMaterials(
  input: CreateDifferentiatedMaterialsInput
): Promise<CreateDifferentiatedMaterialsOutput> {
  return createDifferentiatedMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createDifferentiatedMaterialsPrompt',
  input: {schema: CreateDifferentiatedMaterialsInputSchema},
  output: {schema: CreateDifferentiatedMaterialsOutputSchema},
  prompt: `You are an expert teacher specializing in creating differentiated materials for students of all grade levels.

You will use the textbook page photo to generate multiple versions of a worksheet tailored to different grade levels.

Grade Levels: {{{gradeLevels}}}

Textbook Page Photo: {{media url=textbookPagePhotoDataUri}}

Generate multiple versions of a worksheet tailored to these grade levels.
`,
});

const createDifferentiatedMaterialsFlow = ai.defineFlow(
  {
    name: 'createDifferentiatedMaterialsFlow',
    inputSchema: CreateDifferentiatedMaterialsInputSchema,
    outputSchema: CreateDifferentiatedMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
