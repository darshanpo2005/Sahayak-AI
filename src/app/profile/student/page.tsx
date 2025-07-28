
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Loader2 } from "lucide-react";
import { getCoursesForStudent, getTeacherById, Course, Student, Teacher } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/clientAuth";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Record<string, Teacher>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'student') {
      router.push('/student/login');
      return;
    }
    setStudent(session.user as Student);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!student) return;
      setIsLoading(true);
      try {
        const coursesData = await getCoursesForStudent(student.id!);
        setEnrolledCourses(coursesData);

        const teacherIds = [...new Set(coursesData.map(c => c.teacherId))];
        const teacherPromises = teacherIds.map(id => getTeacherById(id));
        const teachersData = await Promise.all(teacherPromises);
        
        const teachersMap: Record<string, Teacher> = {};
        teachersData.forEach(t => {
          if (t) teachersMap[t.id!] = t;
        });
        setTeachers(teachersMap);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load profile data.`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (student) {
      fetchData();
    }
  }, [student, toast]);
  
  const getTeacherName = (teacherId: string) => {
    return teachers[teacherId]?.name || 'N/A';
  }

  if (!student) {
    return (
       <DashboardPage title="My Profile" role="Student">
         <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
       </DashboardPage>
    )
  }

  return (
    <DashboardPage title="My Profile" role="Student">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <Avatar className="w-24 h-24 mb-4">
                 <AvatarImage src={`https://placehold.co/128x128.png?text=${student.name.charAt(0)}`} alt={student.name} data-ai-hint="profile picture" />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription>{student.email}</CardDescription>
              <Badge>{student.grade}</Badge>
            </CardHeader>
            <CardContent className="text-center">
               <p className="text-muted-foreground text-xs">{student.id}</p>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={2} className="text-center">
                           <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                  ) : enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{getTeacherName(course.teacherId)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Not enrolled in any courses.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
