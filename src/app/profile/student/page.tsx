"use client"

import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Loader2 } from "lucide-react";
import { getCoursesForStudent, getStudentByName, Course, Student, getTeacherById, Teacher } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Record<string, Teacher>>({});
  const [isLoading, setIsLoading] = useState(true);

  // For prototype purposes, we'll fetch a specific student.
  // In a real app, you'd get the logged-in user's ID.
  const studentNameToFetch = "Alex Doe"; 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const studentData = await getStudentByName(studentNameToFetch);
        setStudent(studentData);

        if (studentData) {
          const coursesData = await getCoursesForStudent(studentData.id!);
          setEnrolledCourses(coursesData);

          // Fetch all teachers for the courses
          const teacherIds = [...new Set(coursesData.map(c => c.teacherId))];
          const teacherPromises = teacherIds.map(id => getTeacherById(id));
          const teachersData = await Promise.all(teacherPromises);
          
          const teachersMap: Record<string, Teacher> = {};
          teachersData.forEach(t => {
            if (t) teachersMap[t.id!] = t;
          });
          setTeachers(teachersMap);
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load profile data. Have you added a student named "${studentNameToFetch}"?`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  
  const getTeacherName = (teacherId: string) => {
    return teachers[teacherId]?.name || 'N/A';
  }

  return (
    <DashboardPage title="My Profile" role="Student">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : student ? (
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
                <Badge>{student.grade}</Badge>
              </CardHeader>
              <CardContent className="text-center">
                 <p className="text-muted-foreground">{student.id}</p>
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
                    {enrolledCourses.length > 0 ? (
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
      ) : (
        <Card className="text-center p-8">
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>
                Could not find a student named "{studentNameToFetch}". Please add them via the Management dashboard.
            </CardDescription>
        </Card>
      )}
    </DashboardPage>
  );
}
