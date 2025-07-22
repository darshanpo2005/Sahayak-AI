'use server';

/**
 * @fileOverview An AI agent for translating text into different languages.
 *
 * - translateText - A function that handles the text translation.
 */

import { ai } from '@/ai/genkit';
import type { TranslateTextInput, TranslateTextOutput } from '@/lib/actions';

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  const { text, targetLanguage } = input;

  const prompt = `Translate the following text into ${targetLanguage}.
  
  Only return the translated text, nothing else.

  Text to translate:
  "${text}"
  `;

  const response = await ai.generate({
    prompt: prompt,
  });

  const translation = response.text;

  if (!translation) {
    throw new Error('Translation failed or returned empty.');
  }

  return { translation };
}
