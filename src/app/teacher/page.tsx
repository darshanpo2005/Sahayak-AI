"use client";

import { useState } from "react";
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
import { Lightbulb, HelpCircle, BarChart3, Bot, Sparkles, Loader2 } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";

export default function TeacherPage() {
  const [lessonPlan, setLessonPlan] = useState<GenerateLessonPlanAssistanceOutput | null>(null);
  const [isLessonPlanLoading, setIsLessonPlanLoading] = useState(false);
  const [lessonPlanError, setLessonPlanError] = useState<string | null>(null);
  
  const [quiz, setQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

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
    } else {
      setQuizError(result.error);
    }
    setIsQuizLoading(false);
  };

  const students = [
    { name: "Alice Johnson", progress: 85, status: "On Track" },
    { name: "Bob Williams", progress: 60, status: "Needs Help" },
    { name: "Charlie Brown", progress: 95, status: "Excelling" },
    { name: "Diana Miller", progress: 72, status: "On Track" },
  ];

  return (
    <DashboardPage title="Teacher Dashboard" role="Teacher">
      <Tabs defaultValue="lesson-plan">
        <TabsList className="mb-6">
          <TabsTrigger value="lesson-plan"><Lightbulb className="mr-2 h-4 w-4" />Lesson Plan Assistance</TabsTrigger>
          <TabsTrigger value="quiz"><HelpCircle className="mr-2 h-4 w-4" />Generate Quiz Questions</TabsTrigger>
          <TabsTrigger value="progress"><BarChart3 className="mr-2 h-4 w-4" />Student Progress</TabsTrigger>
        </TabsList>

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
                <CardDescription>Provide a topic and number of questions to generate a quiz.</CardDescription>
              </CardHeader>
              <form onSubmit={handleQuizSubmit}>
                <CardContent className="space-y-4">
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
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate Questions</>
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
                <ScrollArea className="h-[250px] w-full p-4 border rounded-md bg-muted/20">
                  {isQuizLoading && (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                    </div>
                  )}
                  {quizError && <p className="text-destructive">{quizError}</p>}
                  {quiz ? (
                    <ul className="space-y-3 list-decimal list-inside">
                      {quiz.questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
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
              <CardDescription>Overview of your students' performance. (Simulated Data)</CardDescription>
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
                  {students.map((student) => (
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
