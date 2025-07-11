"use server";

import { generateLessonPlanAssistance, GenerateLessonPlanAssistanceInput, GenerateLessonPlanAssistanceOutput } from "@/ai/flows/generate-lesson-plan-assistance";
import { generateQuizQuestions, GenerateQuizQuestionsInput, GenerateQuizQuestionsOutput } from "@/ai/flows/generate-quiz-questions";

type LessonPlanResult = {
  success: true;
  data: GenerateLessonPlanAssistanceOutput;
} | {
  success: false;
  error: string;
};

type QuizResult = {
  success: true;
  data: GenerateQuizQuestionsOutput;
} | {
  success: false;
  error: string;
};

export async function getLessonPlan(input: GenerateLessonPlanAssistanceInput): Promise<LessonPlanResult> {
  if (!input.subject || !input.gradeLevel) {
    return { success: false, error: "Subject and Grade Level are required." };
  }

  try {
    const result = await generateLessonPlanAssistance(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return { success: false, error: "An unexpected error occurred while generating the lesson plan." };
  }
}

export async function getQuiz(input: GenerateQuizQuestionsInput): Promise<QuizResult> {
  if (!input.topic || !input.numQuestions) {
    return { success: false, error: "Topic and Number of Questions are required." };
  }
  
  try {
    const result = await generateQuizQuestions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return { success: false, error: "An unexpected error occurred while generating the quiz." };
  }
}

// Export types for use in client components
export type { GenerateLessonPlanAssistanceOutput, GenerateQuizQuestionsOutput };
