
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLessonPlan, getQuiz, getAssignment } from "@/lib/actions";
import type { GenerateLessonPlanAssistanceOutput, GenerateQuizQuestionsOutput, GenerateAssignmentOutput } from "@/lib/actions";
import { Lightbulb, HelpCircle, BarChart3, Bot, Sparkles, Loader2, CalendarCheck, CheckCircle2, RefreshCw, ClipboardEdit } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getStudents, Student, Teacher, getCourses, Course, QuizResult, getQuizResultsForCourse } from "@/lib/services";
import { getSession } from "@/lib/authService";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentProgressChart } from "@/components/analytics/student-progress-chart";

// Client-side Quiz Storage
type StoredQuiz = GenerateQuizQuestionsOutput & { courseId: string };
const storeQuiz = (courseId: string, quizData: GenerateQuizQuestionsOutput) => {
  if (typeof window === 'undefined') return;
  const quizKey = `quiz_${courseId}`;
  const storedQuiz: StoredQuiz = { ...quizData, courseId };
  localStorage.setItem(quizKey, JSON.stringify(storedQuiz));
};

export default function TeacherPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);

  const [lessonPlan, setLessonPlan] = useState<GenerateLessonPlanAssistanceOutput | null>(null);
  const [isLessonPlanLoading, setIsLessonPlanLoading] = useState(false);
  const [lessonPlanError, setLessonPlanError] = useState<string | null>(null);
  
  const [quiz, setQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizCourseId, setQuizCourseId] = useState<string>("");

  const [assignment, setAssignment] = useState<GenerateAssignmentOutput | null>(null);
  const [isAssignmentLoading, setIsAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [progressCourseId, setProgressCourseId] = useState<string>("");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== 'teacher') {
      router.push('/teacher/login');
    } else {
      setSession(currentSession as { user: Teacher; role: 'teacher' });
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsStudentsLoading(true);
      try {
        const [studentsData, coursesData] = await Promise.all([
          getStudents(),
          getCourses(),
        ]);
        const teacherStudents = studentsData.filter(s => s.teacherId === session.user.id)
        const teacherCourses = coursesData.filter(c => c.teacherId === session.user.id)
        setStudents(teacherStudents);
        setCourses(teacherCourses);
        if (teacherCourses.length > 0 && !progressCourseId) {
          setProgressCourseId(teacherCourses[0].id);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data.",
        });
      } finally {
        setIsStudentsLoading(false);
      }
    };
    if (session) {
      fetchData();
    }
  }, [session, toast, progressCourseId]);

  const fetchProgressData = async () => {
    if (!progressCourseId) return;
    setIsProgressLoading(true);
    try {
        const results = await getQuizResultsForCourse(progressCourseId);
        setQuizResults(results);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load student progress.",
        });
    } finally {
        setIsProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressCourseId]);

  const handleLessonPlanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLessonPlanLoading(true);
    setLessonPlan(null);
    setLessonPlanError(null);
    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const gradeLevel = formData.get("gradeLevel") as string;
    
    const result = await getLessonPlan({ subject, gradeLevel });
    if (result.success) {
      setLessonPlan(result.data);
    } else {
      setLessonPlanError(result.error);
    }
    setIsLessonPlanLoading(false);
  };

  const handleQuizSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quizCourseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a course for the quiz.",
      });
      return;
    }
    setIsQuizLoading(true);
    setQuiz(null);
    setQuizError(null);
    const formData = new FormData(e.currentTarget);
    const topic = formData.get("topic") as string;
    const numQuestions = Number(formData.get("numQuestions"));
    
    const result = await getQuiz({ topic, numQuestions });
    if (result.success) {
      setQuiz(result.data);
      storeQuiz(quizCourseId, result.data);
      toast({
        title: "Quiz Generated & Stored",
        description: `The quiz for ${courses.find(c => c.id === quizCourseId)?.title} is now available for students.`,
      });
    } else {
      setQuizError(result.error);
      toast({
        variant: "destructive",
        title: "Quiz Generation Failed",
        description: result.error,
      });
    }
    setIsQuizLoading(false);
  };
  
  const handleAssignmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAssignmentLoading(true);
    setAssignment(null);
    setAssignmentError(null);
    const formData = new FormData(e.currentTarget);
    const subject = formData.get("assignmentSubject") as string;
    const assignmentType = formData.get("assignmentType") as string;

    const result = await getAssignment({ subject, assignmentType });
    if (result.success) {
      setAssignment(result.data);
    } else {
      setAssignmentError(result.error);
      toast({
        variant: "destructive",
        title: "Assignment Generation Failed",
        description: result.error,
      });
    }
    setIsAssignmentLoading(false);
  };

  const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Attendance Submitted",
      description: "Today's attendance has been successfully recorded.",
    });
  };

  const getStudentProgress = (studentId: string) => {
    const studentResults = quizResults.filter(r => r.studentId === studentId);
    if (studentResults.length === 0) return { score: "N/A", status: "No Quiz Taken" };
    // Get latest score
    const latestResult = studentResults.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
    const score = latestResult.score;
    let status;
    if (score >= 90) status = "Excelling";
    else if (score >= 70) status = "On Track";
    else status = "Needs Help";
    return { score: `${score.toFixed(0)}%`, status };
  };
  

  if (!session) {
    return (
       <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <DashboardPage title="Teacher Dashboard" role="Teacher">
      <Tabs defaultValue="attendance">
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
          <TabsTrigger value="attendance"><CalendarCheck className="mr-2 h-4 w-4"/>Attendance</TabsTrigger>
          <TabsTrigger value="lesson-plan"><Lightbulb className="mr-2 h-4 w-4" />Lesson Plan</TabsTrigger>
          <TabsTrigger value="assignments"><ClipboardEdit className="mr-2 h-4 w-4" />Assignments</TabsTrigger>
          <TabsTrigger value="quiz"><HelpCircle className="mr-2 h-4 w-4" />Quiz</TabsTrigger>
          <TabsTrigger value="progress"><BarChart3 className="mr-2 h-4 w-4" />Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Take Attendance</CardTitle>
              <CardDescription>Mark student attendance for {new Date().toLocaleDateString()}.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAttendanceSubmit}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isStudentsLoading && <TableRow><TableCell colSpan={2} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                    {!isStudentsLoading && students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-right">
                          <RadioGroup defaultValue="present" name={`attendance-${student.name}`} className="justify-end gap-4 sm:gap-6 flex flex-row">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="present" id={`${student.name}-present`} />
                                <Label htmlFor={`${student.name}-present`}>Present</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="absent" id={`${student.name}-absent`} />
                                <Label htmlFor={`${student.name}-absent`}>Absent</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="late" id={`${student.name}-late`} />
                                <Label htmlFor={`${student.name}-late`}>Late</Label>
                              </div>
                          </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                  <Button type="submit" className="w-full sm:w-auto ml-auto">Submit Attendance</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="lesson-plan">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Plan Assistance</CardTitle>
                <CardDescription>Provide a subject and grade level to get an AI-generated lesson plan outline.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLessonPlanSubmit}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="e.g., World History" required />
                  </div>
                  <div>
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Input id="gradeLevel" name="gradeLevel" placeholder="e.g., 9th Grade" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLessonPlanLoading} className="w-full">
                    {isLessonPlanLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate Outline</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> AI Response</CardTitle>
                <CardDescription>The generated lesson plan outline will appear here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-[250px] w-full p-4 border rounded-md bg-muted/20">
                  {isLessonPlanLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  )}
                  {lessonPlanError && <p className="text-destructive">{lessonPlanError}</p>}
                  {lessonPlan ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm">{lessonPlan.lessonPlanOutline}</pre>
                  ) : !isLessonPlanLoading && !lessonPlanError && (
                    <p className="text-muted-foreground">Your generated content will be displayed here.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assignments">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Generator</CardTitle>
                <CardDescription>Generate writing or project-based tasks based on a subject.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAssignmentSubmit}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="assignmentSubject">Subject</Label>
                    <Input id="assignmentSubject" name="assignmentSubject" placeholder="e.g., Environmental Science" required />
                  </div>
                  <div>
                    <Label htmlFor="assignmentType">Assignment Type</Label>
                    <Select name="assignmentType" defaultValue="Project Idea" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assignment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Project Idea">Project Idea</SelectItem>
                        <SelectItem value="Essay Prompt">Essay Prompt</SelectItem>
                        <SelectItem value="Worksheet">Worksheet</SelectItem>
                        <SelectItem value="Debate Topic">Debate Topic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isAssignmentLoading} className="w-full">
                    {isAssignmentLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate Assignment</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> Generated Assignment</CardTitle>
                <CardDescription>The generated assignment details will appear here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-[250px] w-full p-4 border rounded-md bg-muted/20">
                  {isAssignmentLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  )}
                  {assignmentError && <p className="text-destructive">{assignmentError}</p>}
                  {assignment ? (
                    <div className="space-y-2">
                      <h4 className="font-bold">{assignment.assignmentTitle}</h4>
                      <pre className="whitespace-pre-wrap font-sans text-sm">{assignment.assignmentDescription}</pre>
                    </div>
                  ) : !isAssignmentLoading && !assignmentError && (
                    <p className="text-muted-foreground">Your generated content will be displayed here.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="quiz">
           <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Generator</CardTitle>
                <CardDescription>Provide a topic and number of questions to generate a quiz.</CardDescription>
              </CardHeader>
              <form onSubmit={handleQuizSubmit}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quizCourseId">Course</Label>
                    <Select name="quizCourseId" onValueChange={setQuizCourseId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" name="topic" placeholder="e.g., The French Revolution" required />
                  </div>
                  <div>
                    <Label htmlFor="numQuestions">Number of Questions</Label>
                    <Input id="numQuestions" name="numQuestions" type="number" min="1" max="10" defaultValue="5" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isQuizLoading} className="w-full">
                    {isQuizLoading ? (
                       <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate & Store Quiz</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> Generated Questions</CardTitle>
                <CardDescription>The generated quiz questions will appear here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-[300px] w-full p-4 border rounded-md bg-muted/20">
                  {isQuizLoading && (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                    </div>
                  )}
                  {quizError && <p className="text-destructive">{quizError}</p>}
                  {quiz ? (
                    <div className="space-y-6">
                      {quiz.questions.map((q, i) => (
                        <div key={i}>
                          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                          <ul className="space-y-1 pl-4">
                            {q.options.map((option, j) => (
                              <li key={j} className={cn("flex items-center gap-2", option === q.correctAnswer && "text-primary font-medium")}>
                                {option === q.correctAnswer && <CheckCircle2 className="h-4 w-4" />}
                                {option}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : !isQuizLoading && !quizError && (
                     <p className="text-muted-foreground">Your generated questions will be displayed here.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>Overview of your students' performance on the latest quiz.</CardDescription>
              </div>
              <Button onClick={fetchProgressData} variant="outline" size="sm" disabled={isProgressLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isProgressLoading && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="pt-2">
                    <Label htmlFor="progressCourse">Select Course</Label>
                    <Select value={progressCourseId} onValueChange={setProgressCourseId}>
                        <SelectTrigger id="progressCourse">
                            <SelectValue placeholder="Select a course"/>
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <div className="h-80">
                {isProgressLoading ? (
                   <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                   </div>
                ) : (
                  <StudentProgressChart results={quizResults} />
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Latest Score</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProgressLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                   ) : students.length > 0 ? (
                    students.map((student) => {
                      const progress = getStudentProgress(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            {progress.score}
                          </TableCell>
                          <TableCell className="text-right">
                             <Badge variant={progress.status === "On Track" ? "default" : progress.status === "Needs Help" ? "destructive" : "secondary"}>{progress.status}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                   ) : (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No students assigned.</TableCell></TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
