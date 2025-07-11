"use client"

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User } from "lucide-react";

export default function StudentProfilePage() {

  const student = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    grade: "10th Grade",
    avatarUrl: "https://placehold.co/128x128.png",
  };

  const enrolledCourses = [
    { title: "Introduction to Algebra", teacher: "Jane Doe", progress: 85 },
    { title: "World History: Ancient Civilizations", teacher: "Robert Frost", progress: 72 },
  ];

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
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledCourses.map((course) => (
                    <TableRow key={course.title}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.teacher}</TableCell>
                      <TableCell>{course.progress}%</TableCell>
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
