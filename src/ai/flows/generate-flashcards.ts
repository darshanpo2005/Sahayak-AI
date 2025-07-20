'use server';

/**
 * @fileOverview AI flow for generating flashcards for students.
 *
 * - generateFlashcards - A function that generates flashcards based on a topic.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate flashcards.'),
  numCards: z.number().default(8).describe('The number of flashcards to generate.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  term: z.string().describe('The term or question for the front of the flashcard.'),
  definition: z.string().describe('The definition or answer for the back of the flashcard.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards, each with a term and a definition.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {
    schema: GenerateFlashcardsOutputSchema,
  },
  prompt: `You are an expert educational content creator. Your task is to generate a set of flashcards for a student based on the provided topic.

  Please generate {{numCards}} flashcards on the following topic: "{{topic}}".

  Each flashcard should have a clear "term" (the front of the card) and a concise "definition" (the back of the card).

  The output MUST be a valid JSON object. It should contain a key named "flashcards", which holds an array of objects. Each object in the array must have the following keys: "term" and "definition".
  `,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return any output.");
    }
    return output;
  }
);
