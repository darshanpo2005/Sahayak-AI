"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, MessageSquare, Send, Bot, Loader2, CalendarCheck, Film, Award, CheckCircle, User, Video, HelpCircle, XCircle, Trophy } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { getTutorResponse, getCertificate, GenerateQuizQuestionsOutput } from "@/lib/actions";
import { getCoursesForStudent, Course, Student, getQuizForCourse, getAttendanceForStudent, AttendanceRecord } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


type ChatMessage = {
  author: "user" | "bot";
  message: string;
};

type QuizAnswers = Record<number, string>;
type QuizResult = {
    score: number;
    total: number;
    answers: QuizAnswers;
} | null;

// Simulate progress for each course
const useSimulatedProgress = (courses: Course[]) => {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (courses.length === 0) return;
    const newProgress: Record<string, number> = {};
    courses.forEach(course => {
      // Create a stable but pseudo-random progress value based on course ID
      const pseudoRandom = (course.id!.charCodeAt(1) % 5) * 20 + 10;
      newProgress[course.id!] = pseudoRandom;
    });
    setProgress(newProgress);
  }, [courses]);

  return progress;
};


export default function StudentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [activeCourseTopic, setActiveCourseTopic] = useState("your course");
  const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);
  const courseProgress = useSimulatedProgress(courses);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  
  // Attendance state
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);


  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== 'student') {
      router.push('/student/login');
    } else {
      setSession(currentSession as { user: Student; role: 'student' });
    }
  }, [router]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!session) return;
      setIsLoadingCourses(true);
      setIsLoadingAttendance(true);
      try {
        const [coursesData, attendanceData] = await Promise.all([
          getCoursesForStudent(session.user.id),
          getAttendanceForStudent(session.user.id)
        ]);
        
        setCourses(coursesData);
        if (coursesData.length > 0) {
            setActiveCourseTopic(coursesData[0].title);
            setActiveCourseId(coursesData[0].id);
        }

        setAttendance(attendanceData);

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data.",
        });
      } finally {
        setIsLoadingCourses(false);
        setIsLoadingAttendance(false);
      }
    };
    if (session) {
      fetchStudentData();
    }
  }, [session, toast]);

  useEffect(() => {
    const fetchQuiz = async () => {
        if (!activeCourseId) return;
        setIsLoadingQuiz(true);
        setQuizData(null);
        setQuizResult(null);
        setQuizAnswers({});
        try {
            const quiz = await getQuizForCourse(activeCourseId);
            setQuizData(quiz);
        } catch (error) {
            toast({ variant: "destructive", title: "Could not load quiz."})
        } finally {
            setIsLoadingQuiz(false);
        }
    }
    fetchQuiz();
  }, [activeCourseId, toast]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { author: "user", message: question }];
    setChatHistory(newHistory);
    const currentQuestion = question;
    setQuestion("");
    setIsAnswering(true);

    try {
        const result = await getTutorResponse({
          question: currentQuestion,
          topic: activeCourseTopic,
          history: chatHistory.map(chat => ({ role: chat.author === 'user' ? 'user' : 'model', content: chat.message })),
        });

        if (result.success) {
          setChatHistory(prev => [...prev, { author: "bot", message: result.data.answer }]);
        } else {
          setChatHistory(prev => [...prev, { author: "bot", message: `Sorry, I encountered an error: ${result.error}` }]);
        }
    } catch (error) {
        setChatHistory(prev => [...prev, { author: "bot", message: `Sorry, an unexpected error occurred.` }]);
    } finally {
        setIsAnswering(false);
    }
  };

  const handleGenerateCertificate = async (courseName: string) => {
    if (!session) return;
    setIsGeneratingCert(courseName);
    const result = await getCertificate({
      studentName: session.user.name,
      courseName: courseName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });
    
    if (result.success) {
      const newWindow = window.open();
      newWindow?.document.write(result.data.certificateHtml);
      newWindow?.document.close();
    } else {
       toast({
        variant: "destructive",
        title: "Certificate Generation Failed",
        description: result.error,
      });
    }
    setIsGeneratingCert(null);
  }

  const handleQuizAnswerChange = (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData) return;

    let score = 0;
    quizData.questions.forEach((q, index) => {
        if (q.correctAnswer === quizAnswers[index]) {
            score++;
        }
    });

    setQuizResult({ score, total: quizData.questions.length, answers: quizAnswers });
    toast({ title: "Quiz Submitted!", description: `You scored ${score} out of ${quizData.questions.length}`});
  }
  
    useEffect(() => {
        // Auto-scroll to the bottom of the chat
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [chatHistory]);

  if (!session) {
    return (
       <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <DashboardPage title="Student Dashboard" role="Student">
      <Tabs defaultValue="courses">
        <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="courses"><Book className="mr-2 h-4 w-4" />My Courses</TabsTrigger>
          <TabsTrigger value="quizzes"><HelpCircle className="mr-2 h-4 w-4" />Quizzes</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="qna"><MessageSquare className="mr-2 h-4 w-4" />AI Tutor</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Access your enrolled courses, modules, and track your progress.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCourses ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full" onValueChange={(value) => {
                    if (value) {
                        const selectedCourse = courses.find(c => c.id === value);
                        if (selectedCourse) {
                          setActiveCourseTopic(selectedCourse.title);
                          setActiveCourseId(selectedCourse.id!);
                          // Clear chat history when switching courses
                          setChatHistory([]);
                        }
                    }
                }}>
                  {courses.map((course) => (
                    <AccordionItem value={course.id!} key={course.id}>
                      <AccordionTrigger className="text-lg font-medium hover:no-underline">
                        <div className="w-full pr-8">
                            <div className="flex justify-between items-center w-full">
                                <span>{course.title}</span>
                                <span className="text-sm font-normal text-muted-foreground">{courseProgress[course.id!]}% Complete</span>
                            </div>
                            <Progress value={courseProgress[course.id!]} className="mt-2 h-2" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                           <p className="text-muted-foreground mb-4">{course.description}</p>
                           {course.liveClass && (
                            <Card className="bg-primary/10 border-primary/40">
                              <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Video className="h-5 w-5 text-primary" />
                                    Live Class Session
                                  </div>
                                </CardTitle>
                                <CardDescription>
                                  {format(new Date(course.liveClass.dateTime), "eeee, MMMM d, yyyy 'at' h:mm a")}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Link href={course.liveClass.url} target="_blank" rel="noopener noreferrer">
                                   <Button className="w-full">
                                      Join Live Class
                                   </Button>
                                </Link>
                              </CardContent>
                            </Card>
                           )}

                          {course.modules.map((module, moduleIndex) => (
                              <Card key={moduleIndex}>
                                 <CardHeader>
                                      <CardTitle className="text-base flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Film className="h-5 w-5 text-primary" />
                                          {module}
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                         <p className="text-muted-foreground">Video player placeholder</p>
                                      </div>
                                 </CardContent>
                              </Card>
                          ))}
                           <div className="pt-4 flex justify-end">
                            <Button
                              onClick={() => handleGenerateCertificate(course.title)}
                              disabled={isGeneratingCert === course.title}
                            >
                              {isGeneratingCert === course.title ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Award className="mr-2 h-4 w-4" />
                              )}
                              Generate Certificate
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quizzes">
            <Card>
                <CardHeader>
                    <CardTitle>Quiz for: {activeCourseTopic}</CardTitle>
                    <CardDescription>Test your knowledge on the material from this course.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingQuiz && (
                         <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                         </div>
                    )}
                    {!isLoadingQuiz && !quizData && (
                        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                            <HelpCircle className="w-12 h-12 mb-4" />
                            <p className="font-semibold">No Quiz Available</p>
                            <p className="text-sm">There is no quiz available for this course yet. Check back later!</p>
                        </div>
                    )}
                    {!isLoadingQuiz && quizData && !quizResult &&(
                        <form onSubmit={handleQuizSubmit} className="space-y-8">
                            {quizData.questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-4 border rounded-lg">
                                    <p className="font-semibold mb-4">{qIndex + 1}. {q.question}</p>
                                    <RadioGroup
                                        onValueChange={(value) => handleQuizAnswerChange(qIndex, value)}
                                        value={quizAnswers[qIndex]}
                                        className="space-y-2"
                                    >
                                        {q.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={`q${qIndex}-o${oIndex}`} />
                                                <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}
                            <Button type="submit" className="w-full" disabled={Object.keys(quizAnswers).length !== quizData.questions.length}>
                                Submit Quiz
                            </Button>
                        </form>
                    )}
                    {quizResult && quizData && (
                        <div className="text-center space-y-6">
                            <Card>
                               <CardHeader>
                                 <CardTitle>Quiz Results</CardTitle>
                               </CardHeader>
                               <CardContent className="space-y-4">
                                   <div className="flex flex-col items-center">
                                      <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
                                      <p className="text-2xl font-bold">You scored</p>
                                      <p className="text-5xl font-extrabold text-primary">{quizResult.score} / {quizResult.total}</p>
                                      <Progress value={(quizResult.score / quizResult.total) * 100} className="w-full max-w-sm mt-4"/>
                                   </div>
                                    <Button onClick={() => setQuizResult(null)}>Try Again</Button>
                               </CardContent>
                            </Card>
                            <div className="space-y-4 text-left">
                                {quizData.questions.map((q, qIndex) => {
                                    const userAnswer = quizResult.answers[qIndex];
                                    const isCorrect = userAnswer === q.correctAnswer;
                                    return (
                                        <div key={qIndex} className={cn("p-4 border rounded-lg", isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10")}>
                                            <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                                            <p className="text-sm mt-2">Your answer: <span className={cn("font-medium", isCorrect ? "text-green-700" : "text-red-700")}>{userAnswer}</span></p>
                                            {!isCorrect && <p className="text-sm">Correct answer: <span className="font-medium text-green-700">{q.correctAnswer}</span></p>}
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
              <CardDescription>Here is a summary of your attendance record.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAttendance ? (
                     <TableRow>
                        <TableCell colSpan={2} className="text-center">
                           <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                  ) : attendance.length > 0 ? (
                    attendance.map((record) => (
                        <TableRow key={record.date}>
                        <TableCell className="font-medium">{format(new Date(record.date), "PPP")}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={record.status === "Present" ? "secondary" : record.status === "Absent" ? "destructive" : "default"}>
                            {record.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qna">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>AI Tutor</CardTitle>
              <CardDescription>Get help with your course content. Currently selected: <span className="font-semibold text-primary">{activeCourseTopic}</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col">
                <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                  {chatHistory.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mb-4" />
                        <p>Ask a question to get started.</p>
                        <p className="text-sm">For example: "What was the main idea of {activeCourseTopic}?"</p>
                     </div>
                  )}
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex items-start gap-3 ${chat.author === 'user' ? 'justify-end' : ''}`}>
                      {chat.author === 'bot' ? (
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-5 h-5"/></AvatarFallback>
                        </Avatar>
                      ) : null}
                       <div className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-wrap font-sans text-sm ${chat.author === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{chat.message}</p>
                      </div>
                       {chat.author === 'user' ? (
                        <Avatar className="w-8 h-8">
                            <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                      ) : null}
                    </div>
                  ))}
                  {isAnswering && (
                     <div className="flex items-start gap-3">
                       <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-5 h-5"/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-3 bg-muted">
                           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                     </div>
                  )}
                  </div>
                </ScrollArea>
            </CardContent>
            <CardHeader className="pt-0 border-t">
              <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask about ${activeCourseTopic}...`}
                  disabled={isAnswering}
                />
                <Button type="submit" disabled={!question.trim() || isAnswering}>
                  {isAnswering ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
