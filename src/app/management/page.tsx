"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, BookOpen, Activity, PlusCircle, Loader2 } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { addTeacher, getTeachers, getStudents, getCourses, addCourse, Teacher, Student, Course } from "@/lib/services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManagementPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [teachersData, studentsData, coursesData] = await Promise.all([
        getTeachers(),
        getStudents(),
        getCourses()
      ]);
      setTeachers(teachersData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("teacherName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("teacherEmail") as HTMLInputElement).value;

    try {
      await addTeacher({ name, email });
      toast({
        title: "Teacher Added",
        description: `${name} has been added successfully.`,
      });
      form.reset();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the teacher.",
      });
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem("courseTitle") as HTMLInputElement).value;
    const description = (form.elements.namedItem("courseDesc") as HTMLTextAreaElement).value;
    const modulesText = (form.elements.namedItem("courseModules") as HTMLTextAreaElement).value;
    const teacherId = (form.elements.namedItem("courseTeacher") as HTMLInputElement).value;
    
    const modules = modulesText.split('\n').filter(m => m.trim() !== '');

    try {
      await addCourse({ title, description, modules, teacherId });
      toast({
        title: "Course Created",
        description: `The course "${title}" has been created.`,
      });
      form.reset();
      fetchDashboardData();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create the course.",
      });
    }
  };

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
                An overview of the platform's current state.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Teachers</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{teachers.length}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{students.length}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{courses.length}</div>}
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
                <form onSubmit={handleAddTeacher} className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="teacherName">Full Name</Label>
                    <Input id="teacherName" name="teacherName" placeholder="e.g., Jane Doe" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="teacherEmail">Email Address</Label>
                    <Input id="teacherEmail" name="teacherEmail" type="email" placeholder="e.g., jane.doe@school.com" required />
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
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && teachers.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.email}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" disabled>Edit</Button>
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
                       {isLoading && <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.grade}</TableCell>
                          <TableCell>{teachers.find(t => t.id === s.teacherId)?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="outline" size="sm" disabled>Edit</Button>
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
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <Label htmlFor="courseTitle">Course Title</Label>
                    <Input id="courseTitle" name="courseTitle" placeholder="e.g., Introduction to Algebra" required />
                  </div>
                   <div>
                    <Label htmlFor="courseTeacher">Assign Teacher</Label>
                    <Select name="courseTeacher" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="courseDesc">Course Description</Label>
                    <Textarea id="courseDesc" name="courseDesc" placeholder="A brief summary of the course content." required />
                  </div>
                  <div>
                    <Label htmlFor="courseModules">Modules (one per line)</Label>
                    <Textarea id="courseModules" name="courseModules" placeholder="Module 1: Basic Equations&#10;Module 2: Functions" rows={4} required />
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
                      {isLoading && <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && courses.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.title}</TableCell>
                          <TableCell>{teachers.find(t => t.id === c.teacherId)?.name || 'N/A'}</TableCell>
                          <TableCell>{c.modules.length}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" disabled>Edit</Button>
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
