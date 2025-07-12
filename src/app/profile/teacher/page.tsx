"use client"

import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Users, Loader2 } from "lucide-react";
import { getCoursesForTeacher, getStudentsForTeacher, getTeacherByName, Course, Student, Teacher } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";


export default function TeacherProfilePage() {
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For prototype purposes, we'll fetch a specific teacher.
  // In a real app, you'd get the logged-in user's ID.
  const teacherNameToFetch = "Jane Doe";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const teacherData = await getTeacherByName(teacherNameToFetch);
        setTeacher(teacherData);

        if (teacherData) {
            const [coursesData, studentsData] = await Promise.all([
                getCoursesForTeacher(teacherData.id!),
                getStudentsForTeacher(teacherData.id!),
            ]);
            setAssignedCourses(coursesData);
            setAssignedStudents(studentsData);
        }
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load profile data. Using mock data.`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  
  const getEnrolledCountForCourse = (courseId: string) => {
    // This is a simulation. In a real app, you'd likely have a direct link between students and courses.
    // For now, we'll just count all students assigned to this teacher.
    return assignedStudents.length;
  }

  return (
    <DashboardPage title="My Profile" role="Teacher">
      {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : teacher ? (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={`https://placehold.co/128x128.png?text=${teacher.name.charAt(0)}`} alt={teacher.name} data-ai-hint="profile picture" />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                <Badge variant="secondary">Teacher</Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{teacher.email}</p>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 grid gap-8">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Assigned Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Enrolled Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {assignedCourses.length > 0 ? (
                        assignedCourses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{getEnrolledCountForCourse(course.id!)}</TableCell>
                        </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                No courses assigned.
                            </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {assignedStudents.length > 0 ? (
                        assignedStudents.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.grade}</TableCell>
                        </TableRow>
                        ))
                     ) : (
                         <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                No students assigned.
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
            <CardTitle>Teacher Not Found</CardTitle>
            <CardDescription>
                Could not find a teacher named "{teacherNameToFetch}". You can add them via the Management dashboard.
            </CardDescription>
        </Card>
      )}
    </DashboardPage>
  );
}
