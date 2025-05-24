
'use server';
/**
 * @fileOverview A Genkit flow for generating multiple-choice test questions.
 *
 * - generateTestQuestions - A function that handles the question generation process.
 * - GenerateTestQuestionsInput - The input type for the generateTestQuestions function.
 * - GenerateTestQuestionsOutput - The return type for the generateTestQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AIQuestion, AIGeneratedTestQuestionsOutput as AppAIGeneratedTestQuestionsOutput, Option as AppOption } from '@/lib/types'; // Using AppOption for app-side typing

// This input schema remains for potential future use of AI question generation.
const GenerateTestQuestionsInputSchema = z.object({
  topic: z.string().min(1).describe('The topic or subject for the test questions.'),
  numberOfQuestions: z.number().int().positive().min(1).max(20)
    .describe('The number of multiple-choice questions to generate.'),
});
export type GenerateTestQuestionsInput = z.infer<typeof GenerateTestQuestionsInputSchema>;

// AI model is expected to return options as A, B, C, D.
const AIModelOptionKeySchema = z.enum(['A', 'B', 'C', 'D']);

const AIQuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options: z.object({
    A: z.string().describe('Option A for the question.'),
    B: z.string().describe('Option B for the question.'),
    C: z.string().describe('Option C for the question.'),
    D: z.string().describe('Option D for the question.'),
  }).describe('The four multiple-choice options (A, B, C, D).'),
  correctAnswer: AIModelOptionKeySchema.describe('The key (A, B, C, or D) of the correct option.'),
  explanation: z.string().optional().describe('A brief explanation for why the correct answer is correct, and optionally why others are incorrect.'),
});

const GenerateTestQuestionsOutputSchema = z.object({
  questions: z.array(AIQuestionSchema).describe('An array of generated multiple-choice questions.'),
});

// The output type for the EXPORTED function will use the app's Option type if mapping is done.
// However, since OMR is now manual, this flow is less critical for the immediate feature.
// Keeping the AIQuestion interface which uses A,B,C,D keys for AI interaction.
// The app's `Question` type uses `Option` ('1'|'2'|'3'|'4') and doesn't expect `aiGeneratedOptions` in that specific A,B,C,D structure.

export async function generateTestQuestions(input: GenerateTestQuestionsInput): Promise<AppAIGeneratedTestQuestionsOutput> {
  const result = await generateTestQuestionsFlow(input);
  // No mapping to '1','2','3','4' needed here as this function is not currently used by OMR creation
  // If it were to be used, a mapping step would be required if the consuming code expects '1'...'4' keys.
  return result; // Directly returns AI-formatted questions
}

const prompt = ai.definePrompt({
  name: 'generateTestQuestionsPrompt',
  input: { schema: GenerateTestQuestionsInputSchema },
  output: { schema: GenerateTestQuestionsOutputSchema },
  prompt: `You are an expert test creator. Your task is to generate a set of multiple-choice questions for a test.

Please generate exactly {{{numberOfQuestions}}} multiple-choice questions on the topic of "{{{topic}}}".

For each question:
1.  Provide clear and concise question text ("questionText").
2.  Provide four distinct options: A, B, C, and D. Ensure these are text strings.
3.  Clearly indicate which option is the correct answer ("correctAnswer") by specifying its key (A, B, C, or D).
4.  Optionally, provide a brief explanation ("explanation") for the correct answer.

The output must be a JSON object matching the specified output schema. Ensure all text is appropriately escaped for JSON.
Do not include any introductory text or summaries outside of the JSON structure.
The primary language for the questions should be English unless the topic inherently suggests otherwise (e.g., "Spanish Vocabulary").
Ensure the questions are appropriate for a general audience, typically high school to early college level, unless the topic specifies a different difficulty.
Vary the question types if possible (e.g., definitions, scenarios, problem-solving if applicable to the topic).
`,
});

const generateTestQuestionsFlow = ai.defineFlow(
  {
    name: 'generateTestQuestionsFlow',
    inputSchema: GenerateTestQuestionsInputSchema,
    outputSchema: GenerateTestQuestionsOutputSchema, // Flow outputs AI-native format
  },
  async (input) => {
    console.log("Generating AI questions for topic:", input.topic, "Count:", input.numberOfQuestions);
    const { output } = await prompt(input);
    if (!output || !output.questions) {
      console.error("AI did not return questions in the expected format.");
      throw new Error("Failed to generate questions: AI output was invalid.");
    }
    console.log(`Generated ${output.questions.length} AI questions successfully.`);
    return output; // Returns AI-native format
  }
);
