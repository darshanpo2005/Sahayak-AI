'use server';

/**
 * @fileOverview AI flow for generating quiz questions for teachers.
 *
 * - generateQuizQuestions - A function that generates quiz questions based on a topic.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions.'),
  numQuestions: z.number().default(5).describe('The number of quiz questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('The generated quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  system: `You are an expert quiz creator for an educational platform. Your role is to generate a specified number of quiz questions based on the provided topic. The output must be a JSON object containing a 'questions' array with the generated questions as strings.`,
  prompt: `Please generate {{numQuestions}} quiz questions on the following topic:

  {{topic}}

  Here is an example of the expected output format:
  {
    "questions": [
      "What is the capital of France?",
      "Who wrote 'To Kill a Mockingbird'?"
    ]
  }

  Each question should be a unique string within the 'questions' array.`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
