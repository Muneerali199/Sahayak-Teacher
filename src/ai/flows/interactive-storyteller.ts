'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an interactive story with multi-speaker audio and illustrations.
 *
 * - generateInteractiveStory - A function that generates a complete story experience.
 * - GenerateInteractiveStoryInput - The input type for the function.
 * - GenerateInteractiveStoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

// Valid TTS voices from the Gemini API, a mix of male and female sounding names.
const ttsVoices = [
  // Potentially male-sounding
  'achernar',
  'algenib',
  'gacrux',
  'iapetus',
  'rasalgethi',
  'sadachbia',
  'schedar',
  'sulafat',
  'zubenelgenubi',
  'fenrir',
  'orus',
  'charon',
  
  // Potentially female-sounding
  'vindemiatrix',
  'achird',
  'alnilam',
  'aoede',
  'callirrhoe',
  'despina',
  'erinome',
  'kore',
  'laomedeia',
  'leda',
  'puck',
  'pulcherrima',
];


// Input Schemas
const GenerateInteractiveStoryInputSchema = z.object({
  prompt: z.string().describe('The creative prompt for the story.'),
  gradeLevel: z.string().describe('The target grade level for the story.'),
  language: z.string().describe('The language for the story, explanation, and audio.'),
});
export type GenerateInteractiveStoryInput = z.infer<typeof GenerateInteractiveStoryInputSchema>;

// Intermediate schema for the story structure
// This is not exported to prevent "use server" issues.
const StoryStructureSchema = z.object({
  title: z.string().describe('The title of the story.'),
  characterName: z
    .string()
    .describe(
      'The name of the single character in the story (excluding the Narrator).'
    ),
  scenes: z.array(
    z.object({
      sceneText: z
        .string()
        .describe(
          'The text of the scene. Prefix dialogue with either "Narrator:" or the character\'s name followed by a colon. E.g., "Narrator: Once upon a time... Squirrely: I found a nut!"'
        ),
      illustrationPrompt: z
        .string()
        .optional()
        .describe('A simple, descriptive prompt to generate a visual aid for this scene.'),
    })
  ),
});

// Output Schema for the final result
const GenerateInteractiveStoryOutputSchema = z.object({
  title: z.string(),
  fullStoryText: z.string().describe('The complete story as a single text block for display.'),
  audioDataUri: z.string().describe("A data URI for the multi-speaker audio file of the story."),
  illustrations: z
    .array(
      z.object({
        sceneText: z.string().describe('The text of the scene associated with this illustration.'),
        imageDataUri: z.string().describe('A data URI for the generated visual aid image.'),
      })
    )
    .describe('A list of illustrations, one for each scene that had an illustration prompt.'),
});
export type GenerateInteractiveStoryOutput = z.infer<typeof GenerateInteractiveStoryOutputSchema>;

// Exported function to be called from the UI
export async function generateInteractiveStory(
  input: GenerateInteractiveStoryInput
): Promise<GenerateInteractiveStoryOutput> {
  return interactiveStorytellerFlow(input);
}

// Prompt to generate the story structure
const storyGeneratorPrompt = ai.definePrompt({
  name: 'storyGeneratorPrompt',
  input: {schema: GenerateInteractiveStoryInputSchema},
  output: {schema: StoryStructureSchema},
  prompt: `You are a creative storyteller for children. Create a wholesome and engaging story based on the prompt below, for the specified grade level and in the specified language.

  Prompt: {{{prompt}}}
  Grade Level: {{{gradeLevel}}}
  Language: {{{language}}}

  Instructions:
  1.  Create a title for the story.
  2.  Your story MUST feature a "Narrator" and exactly one other character.
  3.  Provide the name of the single character in the 'characterName' field.
  4.  Break the story into at least 3-5 scenes.
  5.  For each scene, write the text. IMPORTANT: You MUST prefix all dialogue and narration with the speaker's name and a colon. Use only "Narrator" and the character name you created. Example: "Narrator: The sun was shining. Squirrely: What a lovely day!".
  6.  For scenes that are visually interesting, provide a simple prompt (in English) for a line drawing that could be drawn on a blackboard to illustrate it.
  `,
});

// Helper to convert PCM audio data from TTS to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({channels, sampleRate: rate, bitDepth: sampleWidth * 8});
    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', d => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// The main Genkit flow
const interactiveStorytellerFlow = ai.defineFlow(
  {
    name: 'interactiveStorytellerFlow',
    inputSchema: GenerateInteractiveStoryInputSchema,
    outputSchema: GenerateInteractiveStoryOutputSchema,
  },
  async input => {
    // 1. Generate the story structure
    const {output: storyStructure} = await storyGeneratorPrompt(input);
    if (!storyStructure) {
      throw new Error('Failed to generate story structure.');
    }

    // 2. Prepare for parallel media generation
    const {title, characterName, scenes} = storyStructure;
    const characters = ['Narrator', characterName];
    const fullStoryText = scenes.map(s => s.sceneText).join('\n\n');

    // 2a. Prepare for multi-speaker TTS by randomly selecting two voices
    const shuffledVoices = ttsVoices.sort(() => 0.5 - Math.random());
    const selectedVoices = shuffledVoices.slice(0, 2);

    const speakerMapping: Record<string, string> = {};
    const speakerVoiceConfigs = characters.map((character, index) => {
      const speakerId = `Speaker${index + 1}`;
      speakerMapping[character] = speakerId;
      return {
        speaker: speakerId,
        voiceConfig: {
          prebuiltVoiceConfig: {voiceName: selectedVoices[index]},
        },
      };
    });

    let ttsPrompt = fullStoryText;
    for (const character in speakerMapping) {
      // Use a regex to replace character names at the start of a line
      const regex = new RegExp(`^${character}:`, 'gm');
      ttsPrompt = ttsPrompt.replace(regex, `${speakerMapping[character]}:`);
    }

    // 2b. Prepare for image generation
    const illustrationPromises = scenes
      .filter(scene => scene.illustrationPrompt)
      .map(scene =>
        ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: scene.illustrationPrompt!,
          config: {responseModalities: ['TEXT', 'IMAGE']},
        }).then(response => ({
            sceneText: scene.sceneText,
            imageDataUri: response.media?.url || '',
        }))
        .catch(err => {
            console.error(`Illustration generation failed for prompt "${scene.illustrationPrompt}":`, err);
            return { sceneText: scene.sceneText, imageDataUri: '' }; // Gracefully handle failure
        })
      );

    // 3. Generate audio and images in parallel
    const [audioResponse, illustrationResults] = await Promise.all([
      // Audio Generation
      ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {multiSpeakerVoiceConfig: {speakerVoiceConfigs}},
        },
        prompt: ttsPrompt,
      }),
      // Image Generation
      Promise.all(illustrationPromises),
    ]);
    
    // 4. Process the audio response
    if (!audioResponse.media?.url) {
      throw new Error('No audio media returned from TTS generation.');
    }
    const audioBuffer = Buffer.from(
      audioResponse.media.url.substring(audioResponse.media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavBase64;
    
    // 5. Filter out any failed image generations
    const illustrations = illustrationResults.filter(r => r.imageDataUri);

    // 6. Return the final combined output
    return {
      title,
      fullStoryText,
      audioDataUri,
      illustrations,
    };
  }
);
