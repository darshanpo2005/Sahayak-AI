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

const tutorStudentFlow = ai.defineFlow(
  {
    name: 'tutorStudentFlow',
    inputSchema: TutorStudentInputSchema,
    outputSchema: TutorStudentOutputSchema,
  },
  async (input) => {
    const history = (input.history || []).map(h => ({
      role: h.role,
      content: [{text: h.content}]
    }));

    const {output} = await ai.generate({
        prompt: input.question,
        model: 'googleai/gemini-2.0-flash',
        history,
        system: `You are Sahayak AI, an expert tutor for students. Your goal is to help students understand their course material.

You will answer questions about the following topic: ${input.topic}.

Be friendly, encouraging, and clear in your explanations. If a question is outside the scope of the topic, gently guide them back to the subject.`
    });

    return { answer: output.text! };
  }
);
