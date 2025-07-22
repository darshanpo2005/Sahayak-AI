
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import {
  getStudentsForTeacher,
  getCoursesForTeacher,
  getLatestQuizResultForStudent,
  gradeQuiz,
  Student,
  Course,
  QuizResult
} from "@/lib/services";
import { getQuiz } from "@/lib/actions"; // To get questions
import { Loader2, CheckCircle, XCircle, ChevronRight, Inbox, BookCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type StoredQuiz = {
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  courseId: string;
};

const getStoredQuiz = (courseId: string): StoredQuiz | null => {
  if (typeof window === 'undefined') return null;
  const quizKey = `quiz_${courseId}`;
  const quizData = localStorage.getItem(quizKey);
  return quizData ? JSON.parse(quizData) : null;
};

export default function GradingCenterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<{ user: { id: string, name: string; email: string }; role: 'teacher' } | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<StoredQuiz['questions'] | null>(null);
  const [isGradingLoading, setIsGradingLoading] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession?.role === 'teacher') {
      setSession(currentSession as any);
    } else {
      router.push('/teacher/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const [coursesData, studentsData] = await Promise.all([
          getCoursesForTeacher(session.user.id),
          getStudentsForTeacher(session.user.id)
        ]);
        setCourses(coursesData);
        setStudents(studentsData);

        const courseIdParam = searchParams.get('courseId');
        const studentIdParam = searchParams.get('studentId');

        if (courseIdParam && coursesData.some(c => c.id === courseIdParam)) {
          handleCourseSelect(coursesData.find(c => c.id === courseIdParam)!);
        }
        if (studentIdParam && studentsData.some(s => s.id === studentIdParam)) {
            handleStudentSelect(studentsData.find(s => s.id === studentIdParam)!, courseIdParam)
        }

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load initial data.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, toast, searchParams]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedStudent(null);
    setQuizResult(null);
    setQuizQuestions(null);
    router.push(`/teacher/grading?courseId=${course.id}`);
  };

  const handleStudentSelect = async (student: Student, courseId: string | null = selectedCourse?.id) => {
    if (!courseId) return;
    setIsGradingLoading(true);
    setSelectedStudent(student);
    setQuizResult(null);
    setQuizQuestions(null);
    router.push(`/teacher/grading?courseId=${courseId}&studentId=${student.id}`);
    
    try {
        const result = await getLatestQuizResultForStudent(student.id, courseId);
        setQuizResult(result);
        if (result) {
            const storedQuiz = getStoredQuiz(courseId);
            if (storedQuiz) {
                setQuizQuestions(storedQuiz.questions);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Quiz not found',
                    description: 'The questions for this quiz could not be loaded.'
                });
            }
        }
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch quiz result for this student.'
        });
    } finally {
        setIsGradingLoading(false);
    }
  };
  
  const handleMarkAsGraded = async () => {
    if (!quizResult) return;
    setIsGradingLoading(true);
    try {
        await gradeQuiz(quizResult.id);
        toast({ title: 'Quiz Graded', description: 'The student has been notified.' });
        // Refresh data
        if(selectedStudent && selectedCourse) {
            handleStudentSelect(selectedStudent, selectedCourse.id);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark as graded.' });
    } finally {
        setIsGradingLoading(false);
    }
  }


  return (
    <DashboardPage title="Grading Center" role="Teacher">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Submissions</CardTitle>
          <CardDescription>Select a course and student to view and grade their latest quiz submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Courses Column */}
            <div className="md:col-span-1 border-r pr-6">
              <h3 className="text-lg font-semibold mb-4">Courses</h3>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ul className="space-y-2">
                  {courses.map(course => (
                    <li key={course.id}>
                      <Button
                        variant={selectedCourse?.id === course.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleCourseSelect(course)}
                      >
                        {course.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Students Column */}
            <div className="md:col-span-1 border-r pr-6">
               <h3 className="text-lg font-semibold mb-4">Students</h3>
               {selectedCourse ? (
                   <ul className="space-y-2">
                       {students.map(student => (
                           <li key={student.id}>
                               <Button
                                    variant={selectedStudent?.id === student.id ? "secondary" : "ghost"}
                                    className="w-full justify-between"
                                    onClick={() => handleStudentSelect(student)}
                                    disabled={!selectedCourse}
                                >
                                    {student.name}
                                    <ChevronRight className="h-4 w-4"/>
                               </Button>
                           </li>
                       ))}
                   </ul>
               ) : (
                   <div className="text-center text-muted-foreground mt-10">
                       <p>Select a course to see students.</p>
                   </div>
               )}
            </div>

            {/* Grading View Column */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Submission Details</h3>
              {isGradingLoading ? (
                  <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin h-8 w-8" />
                  </div>
              ) : !selectedStudent || !selectedCourse ? (
                  <div className="text-center text-muted-foreground mt-10">
                       <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                       <p>Select a student to view their submission.</p>
                  </div>
              ) : !quizResult || !quizQuestions ? (
                  <div className="text-center text-muted-foreground mt-10">
                     <p>{selectedStudent.name} has not taken the quiz for {selectedCourse.title} yet.</p>
                  </div>
              ) : (
                <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xl font-bold">{quizResult.score.toFixed(0)}%</h4>
                            {quizResult.graded ? (
                                <Badge variant="secondary"><BookCheck className="h-4 w-4 mr-2"/>Graded</Badge>
                            ) : (
                                <Badge>Ungraded</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {quizResult.correctAnswers} of {quizResult.totalQuestions} correct. Submitted on {new Date(quizResult.submittedAt).toLocaleDateString()}.
                        </p>

                        {quizQuestions.map((q, index) => {
                            const studentAnswer = quizResult.answers[index];
                            const isCorrect = studentAnswer === q.correctAnswer;
                            return (
                                <div key={index} className="p-4 border rounded-md bg-muted/50">
                                    <p className="font-medium flex items-center mb-2">
                                    {isCorrect ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <XCircle className="h-5 w-5 mr-2 text-destructive" />}
                                    {index + 1}. {q.question}
                                    </p>
                                    <p className={cn("pl-7 text-sm", !isCorrect && "text-destructive")}>
                                        Student's answer: <strong>{studentAnswer || "No answer"}</strong>
                                    </p>
                                    {!isCorrect && (
                                    <p className="pl-7 text-sm text-green-600">
                                        Correct answer: <strong>{q.correctAnswer}</strong>
                                    </p>
                                    )}
                                </div>
                            );
                        })}
                        
                         <Button onClick={handleMarkAsGraded} className="w-full mt-4" disabled={quizResult.graded}>
                            {quizResult.graded ? "Already Graded" : "Mark as Graded & Notify"}
                         </Button>
                    </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
