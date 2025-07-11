"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, BookOpen, Activity, PlusCircle } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ManagementPage() {
  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    toast({
      title: "Action Simulated",
      description: `The '${type}' action was successfully simulated.`,
    });
    (e.target as HTMLFormElement).reset();
  };
  
  const teachers = [
    { name: "Jane Doe", email: "jane.doe@school.com", courses: 2 },
    { name: "Robert Frost", email: "robert.frost@school.com", courses: 1 },
  ];

  const students = [
    { name: "Alice Johnson", grade: "10th", teacher: "Jane Doe" },
    { name: "Bob Williams", grade: "9th", teacher: "Robert Frost" },
    { name: "Charlie Brown", grade: "10th", teacher: "Jane Doe" },
  ];

  const courses = [
    { title: "Introduction to Algebra", modules: 3, teacher: "Jane Doe" },
    { title: "World History", modules: 3, teacher: "Robert Frost" },
    { title: "Fundamentals of Biology", modules: 3, teacher: "Jane Doe" },
  ];


  return (
    <DashboardPage title="Management Dashboard" role="Management">
      <Tabs defaultValue="status">
        <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="status"><Activity className="mr-2 h-4 w-4" />System Status</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="mr-2 h-4 w-4" />Course Management</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
           <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                An overview of the platform's current state. (Simulated Data)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Teachers</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 since last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">153</div>
                  <p className="text-xs text-muted-foreground">+27 since last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">+1 since last month</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add a New Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleFormSubmit(e, "Add Teacher")} className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="teacherName">Full Name</Label>
                    <Input id="teacherName" placeholder="e.g., Jane Doe" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="teacherEmail">Email Address</Label>
                    <Input id="teacherEmail" type="email" placeholder="e.g., jane.doe@school.com" required />
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
                  </Button>
                </form>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Manage Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Courses Assigned</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((t) => (
                        <TableRow key={t.email}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.email}</TableCell>
                          <TableCell>{t.courses}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Manage Students</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Assigned Teacher</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.name}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.grade}</TableCell>
                          <TableCell>{s.teacher}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="outline" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Course</CardTitle>
                <CardDescription>Fill in the details to create a new course.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleFormSubmit(e, "Create Course")} className="space-y-4">
                  <div>
                    <Label htmlFor="courseTitle">Course Title</Label>
                    <Input id="courseTitle" placeholder="e.g., Introduction to Algebra" required />
                  </div>
                  <div>
                    <Label htmlFor="courseDesc">Course Description</Label>
                    <Textarea id="courseDesc" placeholder="A brief summary of the course content." required />
                  </div>
                  <div>
                    <Label htmlFor="courseModules">Modules (one per line)</Label>
                    <Textarea id="courseModules" placeholder="Module 1: Basic Equations&#10;Module 2: Functions" rows={4} required />
                  </div>
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Course
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Assigned Teacher</TableHead>
                        <TableHead>Modules</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((c) => (
                        <TableRow key={c.title}>
                          <TableCell className="font-medium">{c.title}</TableCell>
                          <TableCell>{c.teacher}</TableCell>
                          <TableCell>{c.modules}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
