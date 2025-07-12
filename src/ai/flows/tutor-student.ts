'use server';

/**
 * @fileOverview An AI agent that acts as a student tutor.
 *
 * - tutorStudent - A function that allows a student to ask questions about a topic.
 * - TutorStudentInput - The input type for the tutorStudent function.
 * - TutorStudentOutput - The return type for the tutorStudent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {content, role} from 'genkit/experimental/ai';

const TutorStudentInputSchema = z.object({
  question: z.string().describe('The student\'s question.'),
  topic: z.string().describe('The course topic the question is about. e.g., "Algebra", "World History"'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the model.'),
});
export type TutorStudentInput = z.infer<typeof TutorStudentInputSchema>;

const TutorStudentOutputSchema = z.object({
  answer: z.string().describe('The AI tutor\'s answer to the student\'s question.'),
});
export type TutorStudentOutput = z.infer<typeof TutorStudentOutputSchema>;


export async function tutorStudent(input: TutorStudentInput): Promise<TutorStudentOutput> {
  return tutorStudentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tutorStudentPrompt',
  input: {schema: TutorStudentInputSchema},
  output: {schema: TutorStudentOutputSchema},
  system: `You are Sahayak AI, an expert tutor for students. Your goal is to help students understand their course material.

You will answer questions about the following topic: {{topic}}.

Be friendly, encouraging, and clear in your explanations. If a question is outside the scope of the topic, gently guide them back to the subject.`,
});

const tutorStudentFlow = ai.defineFlow(
  {
    name: 'tutorStudentFlow',
    inputSchema: TutorStudentInputSchema,
    outputSchema: TutorStudentOutputSchema,
  },
  async (input) => {
    
    const history = (input.history || []).map(h => content(role(h.role), h.content));

    const {output} = await prompt({
        topic: input.topic,
        question: input.question,
    }, { history });

    return output!;
  }
);
