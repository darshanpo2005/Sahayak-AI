import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-plan-assistance.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/tutor-student.ts';
import '@/ai/flows/generate-certificate.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-assignment.ts';
import '@/ai/flows/translate-text.ts';
