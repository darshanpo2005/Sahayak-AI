"use client"

import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Users, Loader2 } from "lucide-react";
import { getCourses, getStudents, Course, Student } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";


export default function TeacherProfilePage() {
  const { toast } = useToast();
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teacher = {
    name: "Jane Doe",
    email: "jane.doe@school.com",
    department: "Mathematics",
    avatarUrl: "https://placehold.co/128x128.png",
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, studentsData] = await Promise.all([
          getCourses(),
          getStudents(),
        ]);
        setAssignedCourses(coursesData);
        setAssignedStudents(studentsData);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  return (
    <DashboardPage title="My Profile" role="Teacher">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={teacher.avatarUrl} alt={teacher.name} data-ai-hint="profile picture" />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{teacher.name}</CardTitle>
              <Badge variant="secondary">{teacher.department}</Badge>
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
                  {isLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                  ) : (
                    assignedCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{assignedStudents.length}</TableCell>
                      </TableRow>
                    ))
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
                   {isLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                  ) : (
                    assignedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                      </TableRow>
                    ))
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
