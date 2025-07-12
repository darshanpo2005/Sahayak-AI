
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, HelpCircle, Trophy, CheckCircle, XCircle } from "lucide-react";
import { getCoursesForStudent, getQuizForCourse, saveQuizResult, Course, Student } from "@/lib/services";
import type { GenerateQuizQuestionsOutput } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { cn } from "@/lib/utils";

type QuizAnswers = Record<number, string>;
type QuizResult = {
    score: number;
    total: number;
    answers: QuizAnswers;
} | null;

export default function StudentQuizzesPage() {
    const { toast } = useToast();
    const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [quiz, setQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [answers, setAnswers] = useState<QuizAnswers>({});
    const [result, setResult] = useState<QuizResult>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const currentSession = getSession();
        if (currentSession?.role === 'student') {
            setSession(currentSession as { user: Student; role: 'student' });
        }
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!session) return;
            setIsLoadingCourses(true);
            try {
                const coursesData = await getCoursesForStudent(session.user.id);
                setCourses(coursesData);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load courses." });
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [session, toast]);

    const handleCourseChange = async (courseId: string) => {
        setSelectedCourse(courseId);
        setQuiz(null);
        setResult(null);
        setAnswers({});
        if (!courseId) return;

        setIsLoadingQuiz(true);
        try {
            const quizData = await getQuizForCourse(courseId);
            if (quizData) {
                setQuiz(quizData);
            } else {
                toast({ variant: "default", title: "No Quiz", description: "No quiz is available for this course yet." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch the quiz." });
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleAnswerChange = (questionIndex: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quiz || !session) return;
        setIsSubmitting(true);

        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) {
                score++;
            }
        });

        const newResult: QuizResult = { score, total: quiz.questions.length, answers };
        setResult(newResult);

        try {
            await saveQuizResult({
                studentId: session.user.id,
                courseId: selectedCourse,
                score,
                total: quiz.questions.length,
                takenAt: new Date().toISOString()
            });
            toast({ title: "Quiz Submitted", description: `You scored ${score} out of ${quiz.questions.length}` });
        } catch(error) {
             toast({ variant: "destructive", title: "Error", description: "Could not save your quiz result." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle /> Take a Quiz</CardTitle>
                    <CardDescription>Select a course to start a quiz and test your knowledge.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleCourseChange} value={selectedCourse} disabled={isLoadingCourses}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a course..." />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingCourses ? (
                                <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                            ) : (
                                courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)
                            )}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {isLoadingQuiz && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}

            {quiz && !result && (
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Quiz for: {courses.find(c => c.id === selectedCourse)?.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {quiz.questions.map((q, index) => (
                                <fieldset key={index}>
                                    <legend className="font-medium mb-4">{index + 1}. {q.question}</legend>
                                    <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)} className="space-y-2">
                                        {q.options.map((option, i) => (
                                            <div key={i} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                                <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </fieldset>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Submit Quiz
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {result && quiz && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy /> Quiz Result</CardTitle>
                        <CardDescription>You scored {result.score} out of {result.total}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quiz.questions.map((q, index) => {
                             const userAnswer = result.answers[index];
                             const isCorrect = userAnswer === q.correctAnswer;
                            return (
                                <div key={index} className={cn("p-4 rounded-md border", isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
                                    <p className="font-medium mb-2">{index + 1}. {q.question}</p>
                                    <div className="space-y-1 text-sm">
                                        <p className="flex items-center">
                                            Your Answer: <span className="font-semibold ml-1">{userAnswer || 'Not answered'}</span> 
                                            {isCorrect ? <CheckCircle className="ml-2 h-4 w-4 text-green-600" /> : <XCircle className="ml-2 h-4 w-4 text-red-600" />}
                                        </p>
                                        {!isCorrect && (
                                            <p>Correct Answer: <span className="font-semibold ml-1">{q.correctAnswer}</span></p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                     <CardFooter>
                        <Button onClick={() => handleCourseChange(selectedCourse)}>Try Again</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
