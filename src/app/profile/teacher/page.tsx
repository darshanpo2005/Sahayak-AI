"use client"

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Users } from "lucide-react";

export default function TeacherProfilePage() {

  const teacher = {
    name: "Jane Doe",
    email: "jane.doe@school.com",
    department: "Mathematics",
    avatarUrl: "https://placehold.co/128x128.png",
  };

  const assignedCourses = [
    { title: "Introduction to Algebra", students: 25 },
    { title: "Fundamentals of Biology", students: 30 },
  ];
  
  const assignedStudents = [
      { name: "Alice Johnson", grade: "10th" },
      { name: "Charlie Brown", grade: "10th" },
  ]

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
                  {assignedCourses.map((course) => (
                    <TableRow key={course.title}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.students}</TableCell>
                    </TableRow>
                  ))}
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
                  {assignedStudents.map((student) => (
                    <TableRow key={student.name}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
