
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getStudentsForTeacher, Student, Teacher, getCoursesForTeacher, Course } from "@/lib/services";
import { getSession } from "@/lib/authService";
import { Loader2, Users, BookOpen, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeacherPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession && currentSession.role === 'teacher') {
      setSession(currentSession as { user: Teacher; role: 'teacher' });
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session) return;
      
      try {
        const [studentsData, coursesData] = await Promise.all([
           getStudentsForTeacher(session.user.id),
           getCoursesForTeacher(session.user.id)
        ]);
        setStudents(studentsData);
        setCourses(coursesData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load initial dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (session) {
      fetchInitialData();
    }
  }, [session, toast]);

  if (isLoading || !session) {
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {session.user.name}!</CardTitle>
          <CardDescription>Here's a quick overview of your classroom.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{students.length}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{courses.length}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">3</div>}
               <p className="text-xs text-muted-foreground">From recent quiz submissions</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline" size="lg">
            <Link href="/teacher/attendance">Take Attendance</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/teacher/planner">Create Lesson Plan</Link>
          </Button>
           <Button asChild variant="outline" size="lg">
            <Link href="/teacher/quiz-gen">Generate a Quiz</Link>
          </Button>
           <Button asChild variant="outline" size="lg">
            <Link href="/teacher/analytics">View Analytics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
