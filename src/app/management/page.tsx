
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, BookOpen, Activity, PlusCircle, Loader2, Trash2, Edit, ShieldCheck } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { addTeacher, getTeachers, getStudents, getCourses, addCourse, Teacher, Student, Course, addStudent, deleteTeacher, deleteStudent, deleteCourse, updateTeacher, updateStudent, updateCourse } from "@/lib/services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/authService";


type DeletionTarget = { type: 'manager' | 'intern' | 'resource', id: string, name: string } | null;
type EditingTarget = { type: 'manager', data: Teacher } | { type: 'intern', data: Student } | { type: 'resource', data: Course } | null;

export default function ManagementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [managers, setManagers] = useState<Teacher[]>([]);
  const [interns, setInterns] = useState<Student[]>([]);
  const [resources, setResources] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingManager, setIsAddingManager] = useState(false);
  const [isAddingIntern, setIsAddingIntern] = useState(false);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget>(null);
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [managersData, internsData, resourcesData] = await Promise.all([
        getTeachers(),
        getStudents(),
        getCourses()
      ]);
      setManagers(managersData);
      setInterns(internsData);
      setResources(resourcesData);
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

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingManager(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("managerName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("managerEmail") as HTMLInputElement).value;
    const password = (form.elements.namedItem("managerPassword") as HTMLInputElement).value;
    
    try {
      await addTeacher({ name, email, password, role: 'admin' });
      toast({
        title: "Manager Added",
        description: `${name} has been added successfully.`,
      });
      form.reset();
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the manager.",
      });
    } finally {
      setIsAddingManager(false);
    }
  };
  
  const handleAddIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingIntern(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("internName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("internEmail") as HTMLInputElement).value;
    const password = (form.elements.namedItem("internPassword") as HTMLInputElement).value;
    const grade = (form.elements.namedItem("internDept") as HTMLInputElement).value;
    const managerId = (form.elements.namedItem("internManager") as HTMLSelectElement).value;

    try {
      await addStudent({ name, email, password, grade, teacherId: managerId });
      toast({
        title: "Intern Added",
        description: `${name} has been added successfully.`,
      });
      form.reset();
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the intern.",
      });
    } finally {
      setIsAddingIntern(false);
    }
  };


  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingResource(true);
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem("resourceTitle") as HTMLInputElement).value;
    const description = (form.elements.namedItem("resourceDesc") as HTMLTextAreaElement).value;
    const modulesText = (form.elements.namedItem("resourceContent") as HTMLTextAreaElement).value;
    const managerId = (form.elements.namedItem("resourceManager") as HTMLSelectElement).value;
    
    const content = modulesText.split('\n').filter(m => m.trim() !== '');

    try {
      await addCourse({ title, description, modules: content, teacherId: managerId });
      toast({
        title: "Resource Created",
        description: `The resource "${title}" has been created.`,
      });
      form.reset();
      fetchDashboardData();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create the resource.",
      });
    } finally {
        setIsCreatingResource(false);
    }
  };

  const handleDelete = async () => {
    if (!deletionTarget) return;

    try {
      if (deletionTarget.type === 'manager') {
        await deleteTeacher(deletionTarget.id);
      } else if (deletionTarget.type === 'intern') {
        await deleteStudent(deletionTarget.id);
      } else if (deletionTarget.type === 'resource') {
        await deleteCourse(deletionTarget.id);
      }
      toast({
        title: `${deletionTarget.type.charAt(0).toUpperCase() + deletionTarget.type.slice(1)} Deleted`,
        description: `${deletionTarget.name} has been removed.`,
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not delete ${deletionTarget.type}.`,
      });
    } finally {
      setDeletionTarget(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    setIsUpdating(true);
    const form = e.target as HTMLFormElement;

    try {
        if (editingTarget.type === 'manager') {
            const updatedData: Teacher = {
                ...editingTarget.data,
                name: (form.elements.namedItem("editManagerName") as HTMLInputElement).value,
                email: (form.elements.namedItem("editManagerEmail") as HTMLInputElement).value,
                role: 'admin',
            };
            if ((form.elements.namedItem("editManagerPassword") as HTMLInputElement).value) {
                updatedData.password = (form.elements.namedItem("editManagerPassword") as HTMLInputElement).value;
            }
            await updateTeacher(updatedData.id, updatedData);
        } else if (editingTarget.type === 'intern') {
            const updatedData: Student = {
                 ...editingTarget.data,
                name: (form.elements.namedItem("editInternName") as HTMLInputElement).value,
                email: (form.elements.namedItem("editInternEmail") as HTMLInputElement).value,
                grade: (form.elements.namedItem("editInternDept") as HTMLInputElement).value,
                teacherId: (form.elements.namedItem("editInternManager") as HTMLSelectElement).value,
            };
            if ((form.elements.namedItem("editInternPassword") as HTMLInputElement).value) {
                updatedData.password = (form.elements.namedItem("editInternPassword") as HTMLInputElement).value;
            }
            await updateStudent(updatedData.id, updatedData);
        } else if (editingTarget.type === 'resource') {
           const contentText = (form.elements.namedItem("editResourceContent") as HTMLTextAreaElement).value;
           const content = contentText.split('\n').filter(m => m.trim() !== '');
           const updatedData: Course = {
               ...editingTarget.data,
               title: (form.elements.namedItem("editResourceTitle") as HTMLInputElement).value,
               description: (form.elements.namedItem("editResourceDesc") as HTMLTextAreaElement).value,
               teacherId: (form.elements.namedItem("editResourceManager") as HTMLSelectElement).value,
               modules: content,
           };
           await updateCourse(updatedData.id, updatedData);
        }
        
        toast({
            title: "Update Successful",
            description: "Information has been updated.",
        });
        fetchDashboardData();
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: `Could not update the ${editingTarget.type}.`,
        });
    } finally {
        setIsUpdating(false);
        setEditingTarget(null);
    }
  }

  return (
    <DashboardPage title="Manager Dashboard" role="Manager">
      <Tabs defaultValue="status">
        <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="status"><Activity className="mr-2 h-4 w-4" />System Status</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
          <TabsTrigger value="resources"><BookOpen className="mr-2 h-4 w-4" />Resource Management</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
           <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                An overview of the portal's current state.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Managers</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{managers.length}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{interns.length}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{resources.length}</div>}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddManager} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="managerName">Full Name</Label>
                    <Input id="managerName" name="managerName" placeholder="e.g., Jane Doe" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="managerEmail">Email Address</Label>
                    <Input id="managerEmail" name="managerEmail" type="email" placeholder="e.g., jane.doe@bel.com" required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="managerPassword">Password</Label>
                    <Input id="managerPassword" name="managerPassword" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isAddingManager}>
                    {isAddingManager ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     Add Manager
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add a New Intern</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddIntern} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="internName">Full Name</Label>
                    <Input id="internName" name="internName" placeholder="e.g., Alex Doe" required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="internEmail">Email Address</Label>
                    <Input id="internEmail" name="internEmail" type="email" placeholder="e.g., alex.doe@bel.com" required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="internPassword">Password</Label>
                    <Input id="internPassword" name="internPassword" type="password" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="internDept">Department</Label>
                    <Input id="internDept" name="internDept" placeholder="e.g., Cyber-Security" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="internManager">Assign Manager</Label>
                    <Select name="internManager" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full xl:col-span-5" disabled={isAddingIntern}>
                    {isAddingIntern ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     Add Intern
                  </Button>
                </form>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Manage Managers</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && managers.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.email}</TableCell>
                          <TableCell>
                            <Badge variant={'default'}>
                                <ShieldCheck className="mr-1 h-3 w-3" />
                                Manager
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingTarget({ type: 'manager', data: t })}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeletionTarget({ type: 'manager', id: t.id!, name: t.name })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Manage Interns</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Assigned Manager</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {isLoading && <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && interns.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.grade}</TableCell>
                          <TableCell>{managers.find(t => t.id === s.teacherId)?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingTarget({ type: 'intern', data: s })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                             <Button variant="destructive" size="sm" onClick={() => setDeletionTarget({ type: 'intern', id: s.id!, name: s.name })}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Resource</CardTitle>
                <CardDescription>Fill in the details to create a new resource.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div>
                    <Label htmlFor="resourceTitle">Resource Title</Label>
                    <Input id="resourceTitle" name="resourceTitle" placeholder="e.g., Intro to Wireshark" required />
                  </div>
                   <div>
                    <Label htmlFor="resourceManager">Assign Manager</Label>
                    <Select name="resourceManager" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resourceDesc">Resource Description</Label>
                    <Textarea id="resourceDesc" name="resourceDesc" placeholder="A brief summary of the resource." required />
                  </div>
                  <div>
                    <Label htmlFor="resourceContent">Content (PDF/Video links, one per line)</Label>
                    <Textarea id="resourceContent" name="resourceContent" placeholder="https://example.com/guide.pdf\nhttps://youtube.com/watch?v=video" rows={4} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreatingResource}>
                     {isCreatingResource ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     Create Resource
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Resources</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource Title</TableHead>
                        <TableHead>Assigned Manager</TableHead>
                        <TableHead>Content Items</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && resources.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.title}</TableCell>
                          <TableCell>{managers.find(t => t.id === c.teacherId)?.name || 'N/A'}</TableCell>
                          <TableCell>{c.modules.length}</TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingTarget({ type: 'resource', data: c })}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="destructive" size="sm" onClick={() => setDeletionTarget({ type: 'resource', id: c.id!, name: c.title })}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
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

      {/* Deletion Dialog */}
      <AlertDialog open={!!deletionTarget} onOpenChange={() => setDeletionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deletionTarget?.type} <strong>{deletionTarget?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Edit Dialog */}
       <Dialog open={!!editingTarget} onOpenChange={() => setEditingTarget(null)}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit {editingTarget?.type?.charAt(0).toUpperCase()}{editingTarget?.type?.slice(1)}</DialogTitle>
              <DialogDescription>
                 Update the details for {editingTarget?.data.name || editingTarget?.data.title}.
              </DialogDescription>
            </DialogHeader>

            {editingTarget?.type === 'manager' && (
              <div className="grid gap-4 py-4">
                 <div className="grid gap-1.5">
                    <Label htmlFor="editManagerName">Full Name</Label>
                    <Input id="editManagerName" name="editManagerName" defaultValue={editingTarget.data.name} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="editManagerEmail">Email Address</Label>
                    <Input id="editManagerEmail" name="editManagerEmail" type="email" defaultValue={editingTarget.data.email} required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="editManagerPassword">New Password</Label>
                    <Input id="editManagerPassword" name="editManagerPassword" type="password" placeholder="Leave blank to keep current password" />
                  </div>
              </div>
            )}

            {editingTarget?.type === 'intern' && (
                <div className="grid gap-4 py-4">
                     <div className="grid gap-1.5">
                        <Label htmlFor="editInternName">Full Name</Label>
                        <Input id="editInternName" name="editInternName" defaultValue={editingTarget.data.name} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editInternEmail">Email Address</Label>
                        <Input id="editInternEmail" name="editInternEmail" type="email" defaultValue={editingTarget.data.email} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editInternPassword">New Password</Label>
                        <Input id="editInternPassword" name="editInternPassword" type="password" placeholder="Leave blank to keep current password" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editInternDept">Department</Label>
                        <Input id="editInternDept" name="editInternDept" defaultValue={(editingTarget.data as Student).grade} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editInternManager">Assign Manager</Label>
                        <Select name="editInternManager" required defaultValue={(editingTarget.data as Student).teacherId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                            <SelectContent>
                                {managers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            
            {editingTarget?.type === 'resource' && (
                <div className="grid gap-4 py-4">
                     <div className="grid gap-1.5">
                        <Label htmlFor="editResourceTitle">Resource Title</Label>
                        <Input id="editResourceTitle" name="editResourceTitle" defaultValue={editingTarget.data.title} required />
                    </div>
                     <div className="grid gap-1.5">
                        <Label htmlFor="editResourceManager">Assign Manager</Label>
                        <Select name="editResourceManager" required defaultValue={(editingTarget.data as Course).teacherId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                            <SelectContent>
                                {managers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-1.5">
                       <Label htmlFor="editResourceDesc">Resource Description</Label>
                       <Textarea id="editResourceDesc" name="editResourceDesc" defaultValue={(editingTarget.data as Course).description} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editResourceContent">Content (PDF/Video links, one per line)</Label>
                        <Textarea id="editResourceContent" name="editResourceContent" defaultValue={(editingTarget.data as Course).modules.join('\n')} rows={4} required />
                    </div>
                </div>
            )}


            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
