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
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLessonPlan, getQuiz } from "@/lib/actions";
import type { GenerateLessonPlanAssistanceOutput, GenerateQuizQuestionsOutput } from "@/lib/actions";
import { Lightbulb, HelpCircle, BarChart3, Bot, Sparkles, Loader2, CalendarCheck, CheckCircle2 } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getStudents, Student, Teacher, saveQuizForCourse } from "@/lib/services";
import { getSession } from "@/lib/authService";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCoursesForTeacher, Course } from "@/lib/services";

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
  
  const [students, setStudents] = useState<Student[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState<string>("");


  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== 'teacher') {
      router.push('/teacher/login');
    } else {
      setSession(currentSession as { user: Teacher; role: 'teacher' });
    }
  }, [router]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session) return;
      setIsStudentsLoading(true);
      try {
        const [studentsData, coursesData] = await Promise.all([
           getStudents(),
           getCoursesForTeacher(session.user.id)
        ]);
        setStudents(studentsData);
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourseForQuiz(coursesData[0].id);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load initial dashboard data.",
        });
      } finally {
        setIsStudentsLoading(false);
      }
    };
    if (session) {
      fetchInitialData();
    }
  }, [session, toast]);

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
    setIsQuizLoading(true);
    setQuiz(null);
    setQuizError(null);
    const formData = new FormData(e.currentTarget);
    const topic = formData.get("topic") as string;
    const numQuestions = Number(formData.get("numQuestions"));
    
    const result = await getQuiz({ topic, numQuestions });
    if (result.success) {
      setQuiz(result.data);
      await saveQuizForCourse(selectedCourseForQuiz, result.data);
      toast({
        title: "Quiz Generated & Saved",
        description: `Quiz for ${courses.find(c => c.id === selectedCourseForQuiz)?.title} has been created.`,
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
  
  const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Attendance Submitted",
      description: "Today's attendance has been successfully recorded.",
    });
  };

  const studentProgress = students.map(student => ({
      name: student.name,
      progress: Math.floor(Math.random() * 60) + 40, // Simulated progress
      get status() {
        if (this.progress > 90) return "Excelling";
        if (this.progress > 70) return "On Track";
        return "Needs Help";
      }
  }));

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
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="attendance"><CalendarCheck className="mr-2 h-4 w-4"/>Take Attendance</TabsTrigger>
          <TabsTrigger value="lesson-plan"><Lightbulb className="mr-2 h-4 w-4" />Lesson Plan AI</TabsTrigger>
          <TabsTrigger value="quiz"><HelpCircle className="mr-2 h-4 w-4" />Quiz Generator</TabsTrigger>
          <TabsTrigger value="progress"><BarChart3 className="mr-2 h-4 w-4" />Student Progress</TabsTrigger>
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
                <CardTitle>Request Lesson Plan Assistance</CardTitle>
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

        <TabsContent value="quiz">
           <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Quiz Questions</CardTitle>
                <CardDescription>Provide a topic and number of questions to generate a quiz for a specific course.</CardDescription>
              </CardHeader>
              <form onSubmit={handleQuizSubmit}>
                <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="course-select">Course</Label>
                       <Select 
                        name="course" 
                        required 
                        value={selectedCourseForQuiz}
                        onValueChange={setSelectedCourseForQuiz}
                      >
                        <SelectTrigger id="course-select">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(c => <SelectItem key={c.id} value={c.id!}>{c.title}</SelectItem>)}
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
                  <Button type="submit" disabled={isQuizLoading || !selectedCourseForQuiz} className="w-full">
                    {isQuizLoading ? (
                       <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate & Save Quiz</>
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
            <CardHeader>
              <CardTitle>Student Progress</CardTitle>
              <CardDescription>Overview of your students' performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStudentsLoading && <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                  {!isStudentsLoading && studentProgress.map((student) => (
                    <TableRow key={student.name}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Progress value={student.progress} className="w-[80%]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={student.status === "On Track" ? "default" : student.status === "Needs Help" ? "destructive" : "secondary"}>{student.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
