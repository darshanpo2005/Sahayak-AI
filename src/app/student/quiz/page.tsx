
"use client";

import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getCourses, Course, Student, submitQuizResult } from "@/lib/services";
import { getSession } from "@/lib/authService";
import { GenerateQuizQuestionsOutput } from "@/lib/actions";
import { Loader2, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Client-side Quiz Storage
type StoredQuiz = GenerateQuizQuestionsOutput & { courseId: string };

const getStoredQuiz = (courseId: string): StoredQuiz | null => {
  if (typeof window === 'undefined') return null;
  const quizKey = `quiz_${courseId}`;
  const quizData = localStorage.getItem(quizKey);
  return quizData ? JSON.parse(quizData) : null;
};


type AnswerState = Record<number, string>;
type ResultState = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  results: boolean[];
} | null;

export default function StudentQuizPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [result, setResult] = useState<ResultState>(null);
  const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession && currentSession.role === 'student') {
        setSession(currentSession as { user: Student; role: 'student' });
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load courses.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [toast]);

  useEffect(() => {
    if (selectedCourseId) {
      const storedQuiz = getStoredQuiz(selectedCourseId);
      setQuiz(storedQuiz);
      setResult(null);
      setAnswers({});
      setIsTakingQuiz(!!storedQuiz);
    }
  }, [selectedCourseId]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !session || !selectedCourseId) return;

    let correctCount = 0;
    const results = quiz.questions.map((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }
      return isCorrect;
    });

    const finalResult = {
      score: (correctCount / quiz.questions.length) * 100,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length,
      results,
    };
    setResult(finalResult);
    setIsTakingQuiz(false);

    try {
        await submitQuizResult({
            studentId: session.user.id,
            courseId: selectedCourseId,
            score: finalResult.score,
            correctAnswers: finalResult.correctAnswers,
            totalQuestions: finalResult.totalQuestions,
            answers: answers,
        });
        toast({
            title: "Quiz Submitted",
            description: "Your results have been saved."
        });
    } catch(e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save your quiz results."
        });
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <DashboardPage title="Take a Quiz" role="Student">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select a Course</CardTitle>
              <CardDescription>Choose a course to see the available quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Select
                  value={selectedCourseId || ''}
                  onValueChange={(value) => setSelectedCourseId(value)}
                  disabled={isTakingQuiz || !!result}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id!}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>
                {selectedCourse ? `Quiz: ${selectedCourse.title}` : "Quiz"}
              </CardTitle>
              <CardDescription>
                {quiz ? "Answer the questions below." : "Select a course to begin."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCourseId ? (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                    <HelpCircle className="w-12 h-12 mb-4" />
                    <p>Please select a course to start a quiz.</p>
                  </div>
              ) : !quiz ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                  <p>No quiz has been generated for this course yet.</p>
                </div>
              ) : result ? (
                 <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
                  <p className="text-4xl font-bold text-primary mb-4">{result.score.toFixed(0)}%</p>
                  <p className="text-muted-foreground mb-6">You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly.</p>
                  <div className="space-y-4 text-left">
                    {quiz.questions.map((q, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <p className="font-medium flex items-center">
                          {result.results[index] ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <XCircle className="h-5 w-5 mr-2 text-destructive" />}
                          {index + 1}. {q.question}
                        </p>
                        <p className={cn("pl-7 text-sm", !result.results[index] && "text-destructive")}>Your answer: {answers[index] || "No answer"}</p>
                        {!result.results[index] && <p className="pl-7 text-sm text-green-600">Correct answer: {q.correctAnswer}</p>}
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => setSelectedCourseId(null)} className="mt-6">Choose Another Course</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {quiz.questions.map((q, index) => (
                    <div key={index}>
                      <Label className="font-semibold">{index + 1}. {q.question}</Label>
                      <RadioGroup
                        onValueChange={(value) => handleAnswerChange(index, value)}
                        className="mt-2 space-y-1"
                      >
                        {q.options.map((option, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                            <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {isTakingQuiz && (
              <CardFooter>
                <Button onClick={handleSubmitQuiz} className="w-full">Submit Quiz</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
