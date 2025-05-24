
'use server';
/**
 * @fileOverview A Genkit flow for generating multiple-choice test questions.
 *
 * - generateTestQuestions - A function that handles the question generation process.
 * - GenerateTestQuestionsInput - The input type for the generateTestQuestions function.
 * - GenerateTestQuestionsOutput - The return type for the generateTestQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit'; // Corrected import path
import type { AIQuestion, Option } from '@/lib/types';

const GenerateTestQuestionsInputSchema = z.object({
  topic: z.string().min(1).describe('The topic or subject for the test questions.'),
  numberOfQuestions: z.number().int().positive().min(1).max(20) // Max 20 for now
    .describe('The number of multiple-choice questions to generate.'),
});
export type GenerateTestQuestionsInput = z.infer<typeof GenerateTestQuestionsInputSchema>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options: z.object({
    A: z.string().describe('Option A for the question.'),
    B: z.string().describe('Option B for the question.'),
    C: z.string().describe('Option C for the question.'),
    D: z.string().describe('Option D for the question.'),
  }).describe('The four multiple-choice options (A, B, C, D).'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The key (A, B, C, or D) of the correct option.'),
  explanation: z.string().optional().describe('A brief explanation for why the correct answer is correct, and optionally why others are incorrect.'),
});

const GenerateTestQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated multiple-choice questions.'),
});
export type GenerateTestQuestionsOutput = {
  questions: AIQuestion[]; // Using AIQuestion from lib/types for stronger typing in the app
};


export async function generateTestQuestions(input: GenerateTestQuestionsInput): Promise<GenerateTestQuestionsOutput> {
  const result = await generateTestQuestionsFlow(input);
  // Explicitly cast to ensure the structure matches AIQuestion[]
  return {
    questions: result.questions.map(q => ({
        ...q,
        correctAnswer: q.correctAnswer as Option, // Zod enum ensures it's one of 'A', 'B', 'C', 'D'
    }))
  };
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
    outputSchema: GenerateTestQuestionsOutputSchema,
  },
  async (input) => {
    console.log("Generating questions for topic:", input.topic, "Count:", input.numberOfQuestions);
    const { output } = await prompt(input);
    if (!output || !output.questions) {
      console.error("AI did not return questions in the expected format.");
      throw new Error("Failed to generate questions: AI output was invalid.");
    }
    console.log(`Generated ${output.questions.length} questions successfully.`);
    return output;
  }
);
