"use client"

import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Loader2 } from "lucide-react";
import { getCourses, Course, getTeachers, Teacher } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const student = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    grade: "10th Grade",
    avatarUrl: "https://placehold.co/128x128.png",
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, teachersData] = await Promise.all([
          getCourses(),
          getTeachers()
        ]);
        setEnrolledCourses(coursesData);
        setTeachers(teachersData);
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
  
  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'N/A';
  }

  return (
    <DashboardPage title="My Profile" role="Student">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <Avatar className="w-24 h-24 mb-4">
                 <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="profile picture" />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <Badge>{student.grade}</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{student.email}</p>
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
                     <TableRow><TableCell colSpan={2} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                  ) : (
                    enrolledCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{getTeacherName(course.teacherId)}</TableCell>
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
