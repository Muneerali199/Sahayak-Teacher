'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an audio-visual explanation for a topic.
 *
 * - generateAudioVisualExplanation - A function that generates an explanation, an audio track, and a visual aid.
 * - GenerateAudioVisualExplanationInput - The input type for the function.
 * - GenerateAudioVisualExplanationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

// Input Schema
const GenerateAudioVisualExplanationInputSchema = z.object({
  topic: z.string().describe('The topic to explain.'),
  language: z.string().describe('The language for the explanation and audio.'),
});
export type GenerateAudioVisualExplanationInput = z.infer<
  typeof GenerateAudioVisualExplanationInputSchema
>;

// Output Schema
const GenerateAudioVisualExplanationOutputSchema = z.object({
  explanation: z.string().describe('The text explanation of the topic.'),
  audioDataUri: z
    .string()
    .describe(
      "A data URI for the audio file of the explanation. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
  visualAidDataUri: z
    .string()
    .describe(
      "A data URI for the visual aid image. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAudioVisualExplanationOutput = z.infer<
  typeof GenerateAudioVisualExplanationOutputSchema
>;

// Exported function to be called from the UI
export async function generateAudioVisualExplanation(
  input: GenerateAudioVisualExplanationInput
): Promise<GenerateAudioVisualExplanationOutput> {
  return generateAudioVisualExplanationFlow(input);
}

// Prompt to generate the explanation script and a prompt for the visual aid
const scriptAndImagePromptGenerator = ai.definePrompt({
  name: 'scriptAndImagePromptGenerator',
  input: {schema: z.object({topic: z.string(), language: z.string()})},
  output: {
    schema: z.object({
      explanation: z
        .string()
        .describe(
          'A clear and concise explanation of the topic, suitable for a short audio lesson. Keep it under 150 words.'
        ),
      imagePrompt: z
        .string()
        .describe(
          'A simple, descriptive prompt to generate a visual aid for this explanation. Should be a line drawing or simple chart.'
        ),
    }),
  },
  prompt: `You are an expert educator. For the given topic, create a simple explanation in the specified language, and a prompt to generate an accompanying visual aid.

Topic: {{{topic}}}
Language: {{{language}}}`,
});

// Helper function to convert PCM audio data from TTS to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

// The main Genkit flow
const generateAudioVisualExplanationFlow = ai.defineFlow(
  {
    name: 'generateAudioVisualExplanationFlow',
    inputSchema: GenerateAudioVisualExplanationInputSchema,
    outputSchema: GenerateAudioVisualExplanationOutputSchema,
  },
  async (input) => {
    // 1. Generate the script and image prompt first
    const {output: scriptOutput} = await scriptAndImagePromptGenerator(input);
    if (!scriptOutput) {
      throw new Error('Failed to generate script and image prompt.');
    }
    const {explanation, imagePrompt} = scriptOutput;

    // 2. Generate audio and image in parallel to save time
    const [audioResponse, imageResponse] = await Promise.all([
      // Audio Generation
      ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {voiceName: 'Algenib'},
            },
          },
        },
        prompt: explanation,
      }),
      // Image Generation
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);

    // 3. Process the audio response
    if (!audioResponse.media?.url) {
      throw new Error('No audio media returned from TTS generation.');
    }
    const audioBuffer = Buffer.from(
      audioResponse.media.url.substring(
        audioResponse.media.url.indexOf(',') + 1
      ),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavBase64;

    // 4. Process the image response
    if (!imageResponse.media?.url) {
      throw new Error('No image media returned from image generation.');
    }
    const visualAidDataUri = imageResponse.media.url;

    // 5. Return the final combined output
    return {
      explanation,
      audioDataUri,
      visualAidDataUri,
    };
  }
);
