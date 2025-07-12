
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, HelpCircle, Sparkles, Check, Send } from "lucide-react";
import { getQuiz, GenerateQuizQuestionsOutput } from "@/lib/actions";
import { saveQuizForCourse } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getCoursesForTeacher, Teacher, Course } from "@/lib/services";
import { getSession } from "@/lib/authService";
import { useEffect } from "react";

export default function QuizGeneratorPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quiz, setQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession?.role === 'teacher') {
      setSession(currentSession as { user: Teacher; role: 'teacher' });
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!session) return;
      setIsLoadingCourses(true);
      try {
        const coursesData = await getCoursesForTeacher(session.user.id);
        setCourses(coursesData);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load courses." });
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [session, toast]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast({ variant: "destructive", title: "Missing Topic", description: "Please enter a topic for the quiz." });
      return;
    }

    setIsLoading(true);
    setQuiz(null);
    const result = await getQuiz({ topic, numQuestions });
    setIsLoading(false);

    if (result.success) {
      setQuiz(result.data);
    } else {
      toast({ variant: "destructive", title: "Generation Failed", description: result.error });
    }
  };

  const handleSendToStudents = async () => {
    if (!selectedCourse || !quiz) {
        toast({ variant: "destructive", title: "Missing Selection", description: "Please select a course to send the quiz to." });
        return;
    }
    setIsSaving(true);
    try {
        await saveQuizForCourse(selectedCourse, quiz);
        toast({ title: "Quiz Sent!", description: "The quiz is now available for students in the selected course." });
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Could not send the quiz to students." });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form onSubmit={handleGenerateQuiz}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle /> Quiz Generator</CardTitle>
              <CardDescription>
                Create a multiple-choice quiz on any topic for your students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic">Quiz Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min="1"
                  max="10"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Quiz
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[calc(100vh-16rem)]">
          <CardHeader>
            <CardTitle>Generated Quiz</CardTitle>
             {quiz && (
                 <div className="flex items-center gap-2 pt-4">
                    <Select onValueChange={setSelectedCourse} value={selectedCourse} disabled={isLoadingCourses || isSaving}>
                        <SelectTrigger className="w-full md:w-auto">
                            <SelectValue placeholder="Select course to send quiz..." />
                        </SelectTrigger>
                        <SelectContent>
                             {isLoadingCourses ? (
                                <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                            ) : (
                                courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)
                            )}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSendToStudents} disabled={!selectedCourse || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        Send to Students
                    </Button>
                 </div>
             )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : quiz ? (
              <div className="space-y-6">
                {quiz.questions.map((q, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium">{index + 1}. {q.question}</p>
                    <ul className="list-disc list-inside pl-4 space-y-1 text-muted-foreground">
                      {q.options.map(opt => (
                        <li key={opt} className={q.correctAnswer === opt ? "font-bold text-green-600 flex items-center gap-2" : ""}>
                          {opt}
                          {q.correctAnswer === opt && <Check className="h-4 w-4" />}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                <p>Your generated quiz will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
