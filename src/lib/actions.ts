
'use server';

import { z } from 'zod';
import { generateQuizQuestions, GenerateQuizQuestionsInput, GenerateQuizQuestionsOutput } from "@/ai/flows/generate-quiz-questions";
import { tutorStudent, TutorStudentInput, TutorStudentOutput } from "@/ai/flows/tutor-student";
import { generateFlashcards, GenerateFlashcardsInput, GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from "@/ai/flows/text-to-speech";
import { generateAssignment, GenerateAssignmentInput, GenerateAssignmentOutput } from "@/ai/flows/generate-assignment";

type QuizResult = {
  success: true;
  data: GenerateQuizQuestionsOutput;
} | {
  success: false;
  error: string;
};

type TutorResult = {
  success: true;
  data: TutorStudentOutput;
} | {
  success: false;
  error: string;
};

type FlashcardsResult = {
  success: true;
  data: GenerateFlashcardsOutput;
} | {
  success: false;
  error: string;
};

type AudioResult = {
  success: true;
  data: TextToSpeechOutput;
} | {
  success: false;
  error: string;
};

type AssignmentResult = {
  success: true;
  data: GenerateAssignmentOutput;
} | {
  success: false;
  error: string;
};

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

export async function getTutorResponse(input: TutorStudentInput): Promise<TutorResult> {
  if (!input.question || !input.topic) {
    return { success: false, error: "Question and topic are required." };
  }
  
  try {
    const result = await tutorStudent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting tutor response:", error);
    return { success: false, error: "An unexpected error occurred while getting a response." };
  }
}

export async function getFlashcards(input: GenerateFlashcardsInput): Promise<FlashcardsResult> {
  if (!input.topic) {
    return { success: false, error: "Topic is required." };
  }

  try {
    const result = await generateFlashcards(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while generating flashcards.";
    return { success: false, error: errorMessage };
  }
}

export async function getAudioForText(input: TextToSpeechInput): Promise<AudioResult> {
  if (!input.text) {
    return { success: false, error: "Text is required to generate audio." };
  }
  try {
    const result = await textToSpeech(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating audio:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during audio generation.";
    return { success: false, error: errorMessage };
  }
}

export async function getAssignment(input: GenerateAssignmentInput): Promise<AssignmentResult> {
  if (!input.subject || !input.assignmentType) {
    return { success: false, error: "Subject and Assignment Type are required." };
  }

  try {
    const result = await generateAssignment(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating assignment:", error);
    return { success: false, error: "An unexpected error occurred while generating the assignment." };
  }
}


// Export types for use in client components
export type { GenerateQuizQuestionsOutput, TutorStudentOutput, GenerateFlashcardsOutput, GenerateAssignmentOutput };
