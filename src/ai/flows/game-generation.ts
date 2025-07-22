'use server';

/**
 * @fileOverview AI-powered educational game generation flow.
 *
 * - generateGame - A function that generates an educational game.
 * - GenerateGameInput - The input type for the generateGame function.
 * - GenerateGameOutput - The return type for the generateGame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameInputSchema = z.object({
  topic: z.string().describe('The educational topic for the game.'),
  gradeLevel: z.string().describe('The target grade level for the game.'),
});
export type GenerateGameInput = z.infer<typeof GenerateGameInputSchema>;

const GenerateGameOutputSchema = z.object({
  title: z.string().describe('The title of the educational game.'),
  description: z.string().describe('A brief description of the game and its learning objectives.'),
  rules: z.array(z.string()).describe('A list of rules on how to play the game.'),
  materials: z.array(z.string()).describe('A list of materials needed to play the game (if any).'),
});
export type GenerateGameOutput = z.infer<typeof GenerateGameOutputSchema>;

export async function generateGame(input: GenerateGameInput): Promise<GenerateGameOutput> {
  return generateGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGamePrompt',
  input: {schema: GenerateGameInputSchema},
  output: {schema: GenerateGameOutputSchema},
  prompt: `You are a creative game designer specializing in educational games for children. Create a fun and simple game based on the following topic and grade level. The game should be easy to set up and play in a classroom with limited resources.

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}

Generate a title, a brief description, a list of rules, and a list of required materials for the game.
`,
});

const generateGameFlow = ai.defineFlow(
  {
    name: 'generateGameFlow',
    inputSchema: GenerateGameInputSchema,
    outputSchema: GenerateGameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
