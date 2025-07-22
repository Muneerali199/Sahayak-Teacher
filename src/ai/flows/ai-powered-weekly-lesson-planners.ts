'use server';

/**
 * @fileOverview AI-powered weekly lesson planner flow.
 *
 * - createWeeklyLessonPlan - A function that generates a weekly lesson plan.
 * - CreateWeeklyLessonPlanInput - The input type for the createWeeklyLessonPlan function.
 * - CreateWeeklyLessonPlanOutput - The return type for the createWeeklyLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateWeeklyLessonPlanInputSchema = z.object({
  topic: z.string().describe('The topic for the weekly lesson plan.'),
  gradeLevel: z.string().describe('The grade level for the lesson plan.'),
  learningObjectives: z.string().describe('The learning objectives for the week.'),
  localLanguage: z.string().describe('The local language for the lesson plan.'),
});
export type CreateWeeklyLessonPlanInput = z.infer<typeof CreateWeeklyLessonPlanInputSchema>;

const DailyPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., Monday).'),
  topic: z.string().describe('The topic to be covered on this day.'),
  activities: z.array(z.string()).describe('A list of activities for the day.'),
  assessment: z.string().describe("How students will be assessed for the day's learning."),
  resources: z.array(z.string()).describe('A list of resources needed for the day.'),
});

const CreateWeeklyLessonPlanOutputSchema = z.object({
  title: z.string().describe('The title of the weekly lesson plan.'),
  summary: z.string().describe('A brief summary of the weekly lesson plan.'),
  dailyPlans: z
    .array(DailyPlanSchema)
    .describe('A list of daily lesson plans for a 5-day week.'),
});
export type CreateWeeklyLessonPlanOutput = z.infer<typeof CreateWeeklyLessonPlanOutputSchema>;

export async function createWeeklyLessonPlan(input: CreateWeeklyLessonPlanInput): Promise<CreateWeeklyLessonPlanOutput> {
  return createWeeklyLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createWeeklyLessonPlanPrompt',
  input: {schema: CreateWeeklyLessonPlanInputSchema},
  output: {schema: CreateWeeklyLessonPlanOutputSchema},
  prompt: `You are an expert teacher creating a weekly lesson plan.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Learning Objectives: {{{learningObjectives}}}
  Local Language: {{{localLanguage}}}

  Create a detailed weekly lesson plan in {{{localLanguage}}} based on the provided information.
  Structure the output with a title for the week, a brief summary, and a day-by-day breakdown for a 5-day school week (e.g., Monday to Friday).
  For each day, provide a specific topic, a list of engaging activities, a method for assessment, and a list of required resources.
  `,
});

const createWeeklyLessonPlanFlow = ai.defineFlow(
  {
    name: 'createWeeklyLessonPlanFlow',
    inputSchema: CreateWeeklyLessonPlanInputSchema,
    outputSchema: CreateWeeklyLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
