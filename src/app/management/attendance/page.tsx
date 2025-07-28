
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarCheck } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { getStudentsForTeacher, Student, Teacher, addOrUpdateAttendance } from "@/lib/services";
import type { AttendanceStatus } from "@/lib/services";
import { getSession } from "@/lib/authService";

export default function AttendancePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<{ user: Teacher; role: 'admin' } | null>(null);
  const [interns, setInterns] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== 'admin') {
      router.push('/');
    } else {
      setSession(currentSession as { user: Teacher; role: 'admin' });
    }
  }, [router]);

  useEffect(() => {
    const fetchInterns = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const internsData = await getStudentsForTeacher(session.user.id);
        setInterns(internsData);
        // Initialize attendance state
        const initialAttendance: Record<string, AttendanceStatus> = {};
        internsData.forEach(intern => {
          initialAttendance[intern.id] = 'Present';
        });
        setAttendance(initialAttendance);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load intern data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (session) {
      fetchInterns();
    }
  }, [session, toast]);

  const handleAttendanceChange = (internId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [internId]: status }));
  };

  const handleAttendanceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const recordsToSave = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    try {
      await addOrUpdateAttendance(recordsToSave);
      toast({
        title: "Attendance Submitted",
        description: "Today's attendance has been successfully recorded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attendance records.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <DashboardPage title="Attendance" role="Manager">
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage title="Take Attendance" role="Manager">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" />
            Daily Attendance
          </CardTitle>
          <CardDescription>Mark intern attendance for {new Date().toLocaleDateString()}.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAttendanceSubmit}>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern Name</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : interns.length > 0 ? (
                  interns.map((intern) => (
                    <TableRow key={intern.id}>
                      <TableCell className="font-medium">{intern.name}</TableCell>
                      <TableCell className="text-right">
                        <RadioGroup 
                          value={attendance[intern.id] || 'Present'} 
                          onValueChange={(value) => handleAttendanceChange(intern.id, value as AttendanceStatus)}
                          className="justify-end gap-4 sm:gap-6 flex flex-row"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Present" id={`${intern.id}-present`} />
                            <Label htmlFor={`${intern.id}-present`}>Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Absent" id={`${intern.id}-absent`} />
                            <Label htmlFor={`${intern.id}-absent`}>Absent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Late" id={`${intern.id}-late`} />
                            <Label htmlFor={`${intern.id}-late`}>Late</Label>
                          </div>
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      You have no interns assigned.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto ml-auto" disabled={isLoading || interns.length === 0}>
              Submit Attendance
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardPage>
  );
}
