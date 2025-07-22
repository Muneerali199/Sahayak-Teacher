'use server';
/**
 * @fileOverview This file defines a Genkit flow for designing simple visual aids based on a teacher's description.
 *
 * - designVisualAid - A function that generates a visual aid based on the input description.
 * - DesignVisualAidInput - The input type for the designVisualAid function.
 * - DesignVisualAidOutput - The return type for the designVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DesignVisualAidInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A description of the visual aid to generate, suitable for drawing on a blackboard.'
    ),
});
export type DesignVisualAidInput = z.infer<typeof DesignVisualAidInputSchema>;

const DesignVisualAidOutputSchema = z.object({
  visualAidDataUri: z
    .string()
    .describe(
      'A data URI containing the visual aid image, in a format suitable for display in a web page.  The data URI must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type DesignVisualAidOutput = z.infer<typeof DesignVisualAidOutputSchema>;

export async function designVisualAid(input: DesignVisualAidInput): Promise<DesignVisualAidOutput> {
  return designVisualAidFlow(input);
}

const prompt = ai.definePrompt({
  name: 'designVisualAidPrompt',
  input: {schema: DesignVisualAidInputSchema},
  output: {schema: DesignVisualAidOutputSchema},
  prompt: `You are an AI assistant that generates visual aids for teachers.

  Based on the description provided, generate a simple visual aid that can be easily drawn on a blackboard to explain the concept. The visual aid should be a line drawing or a simple chart.

  Description: {{{description}}}

  Include a data URI with a base64 encoded image in the output.
  `,
});

const designVisualAidFlow = ai.defineFlow(
  {
    name: 'designVisualAidFlow',
    inputSchema: DesignVisualAidInputSchema,
    outputSchema: DesignVisualAidOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.description,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No media URL returned from image generation.');
    }

    return {visualAidDataUri: media.url};
  }
);
