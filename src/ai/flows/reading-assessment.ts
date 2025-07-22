'use server';
/**
 * @fileOverview AI-powered reading assessment flow.
 *
 * - assessReading - A function that assesses a student's reading from an audio recording.
 * - AssessReadingInput - The input type for the assessReading function.
 * - AssessReadingOutput - The return type for the assessReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessReadingInputSchema = z.object({
  textToRead: z.string().describe('The text that the student was supposed to read.'),
  audioRecordingDataUri: z
    .string()
    .describe(
      "A data URI of the student's audio recording reading the text. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  gradeLevel: z.string().describe('The grade level of the student.'),
});
export type AssessReadingInput = z.infer<typeof AssessReadingInputSchema>;

const AssessReadingOutputSchema = z.object({
  transcribedText: z.string().describe("The transcription of the student's audio."),
  fluency: z.string().describe('An assessment of the student\'s reading fluency (e.g., "Excellent", "Good", "Needs Improvement").'),
  accuracy: z.number().describe('The percentage of words read correctly.'),
  feedback: z.string().describe('Specific feedback for the student to help them improve.'),
  mispronouncedWords: z.array(z.string()).describe('A list of words that were mispronounced.'),
});
export type AssessReadingOutput = z.infer<typeof AssessReadingOutputSchema>;

export async function assessReading(input: AssessReadingInput): Promise<AssessReadingOutput> {
  return assessReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessReadingPrompt',
  input: {schema: AssessReadingInputSchema},
  output: {schema: AssessReadingOutputSchema},
  prompt: `You are an expert reading coach for students. Your task is to assess a student's reading ability based on an audio recording of them reading a given text.

Grade Level: {{{gradeLevel}}}
Text to Read:
"{{{textToRead}}}"

Student's Audio Recording: {{media url=audioRecordingDataUri}}

Instructions:
1.  Transcribe the student's audio recording.
2.  Compare the transcribed text to the original "Text to Read".
3.  Calculate the reading accuracy as a percentage.
4.  Identify any mispronounced words.
5.  Assess the student's reading fluency (pacing, intonation, expression).
6.  Provide constructive feedback for the student, tailored to their grade level.

Provide the assessment in the required JSON format.
`,
});

const assessReadingFlow = ai.defineFlow(
  {
    name: 'assessReadingFlow',
    inputSchema: AssessReadingInputSchema,
    outputSchema: AssessReadingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
