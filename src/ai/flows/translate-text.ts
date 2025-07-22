'use server';

/**
 * @fileOverview An AI agent for translating text into different languages.
 *
 * - translateText - A function that handles the text translation.
 */

import { generate } from 'genkit';
import type { TranslateTextInput, TranslateTextOutput } from '@/lib/actions';


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const { text, targetLanguage } = input;

  const prompt = `Translate the following text into ${targetLanguage}.
  
  Only return the translated text, nothing else.

  Text to translate:
  "${text}"
  `;

  const { output } = await generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
  });

  const translation = output?.text ?? "";

  if (!translation) {
    throw new Error('Translation failed or returned empty.');
  }

  return { translation };
}
