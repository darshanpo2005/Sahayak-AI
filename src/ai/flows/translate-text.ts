'use server';

/**
 * @fileOverview An AI agent for translating text into different languages.
 *
 * - translateText - A function that handles the text translation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { TranslateTextInput, TranslateTextOutput } from '@/lib/actions';


const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text content to be translated.'),
  targetLanguage: z.string().describe('The target language to translate the text into (e.g., "Spanish", "French").'),
});

const TranslateTextOutputSchema = z.object({
    translation: z.string().describe('The translated text.'),
});

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `You are a translation expert. Translate the following text into {{targetLanguage}}.
  
  Only return the translated text, nothing else.

  Text to translate:
  "{{{text}}}"
  `,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
