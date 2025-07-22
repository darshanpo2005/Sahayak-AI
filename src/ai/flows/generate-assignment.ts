'use server';
/**
 * @fileOverview An AI agent for generating assignments for teachers.
 *
 * - generateAssignment - A function that handles the assignment generation process.
 * - GenerateAssignmentInput - The input type for the generateAssignment function.
 * - GenerateAssignmentOutput - The return type for the generateAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAssignmentInputSchema = z.object({
  subject: z.string().describe('The subject of the assignment.'),
  assignmentType: z.string().describe('The type of assignment to generate (e.g., "Project Idea", "Essay Prompt", "Worksheet").'),
});
export type GenerateAssignmentInput = z.infer<typeof GenerateAssignmentInputSchema>;

const GenerateAssignmentOutputSchema = z.object({
  assignmentTitle: z.string().describe('A creative title for the generated assignment.'),
  assignmentDescription: z.string().describe('A detailed description of the assignment, including instructions for the student.'),
});
export type GenerateAssignmentOutput = z.infer<typeof GenerateAssignmentOutputSchema>;

export async function generateAssignment(input: GenerateAssignmentInput): Promise<GenerateAssignmentOutput> {
  return generateAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssignmentPrompt',
  input: {schema: GenerateAssignmentInputSchema},
  output: {schema: GenerateAssignmentOutputSchema},
  prompt: `You are an expert curriculum designer helping a teacher create an assignment.

  Generate a creative and engaging "{{assignmentType}}" for the subject: "{{subject}}".

  The output should be a detailed assignment with a clear title and a description that includes instructions, goals, and any necessary context for the student.
  `,
});

const generateAssignmentFlow = ai.defineFlow(
  {
    name: 'generateAssignmentFlow',
    inputSchema: GenerateAssignmentInputSchema,
    outputSchema: GenerateAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
