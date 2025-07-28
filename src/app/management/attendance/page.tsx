
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
import { getStudents, Student, Teacher } from "@/lib/services";
import { getSession } from "@/lib/authService";

export default function AttendancePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<{ user: Teacher; role: 'admin' } | null>(null);
  const [interns, setInterns] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);
      try {
        const internsData = await getStudents();
        setInterns(internsData);
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

  const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real application, you would save this data.
    // For now, we just show a confirmation.
    toast({
      title: "Attendance Submitted",
      description: "Today's attendance has been successfully recorded.",
    });
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
                        <RadioGroup defaultValue="present" name={`attendance-${intern.name}`} className="justify-end gap-4 sm:gap-6 flex flex-row">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="present" id={`${intern.name}-present`} />
                            <Label htmlFor={`${intern.name}-present`}>Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="absent" id={`${intern.name}-absent`} />
                            <Label htmlFor={`${intern.name}-absent`}>Absent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="late" id={`${intern.name}-late`} />
                            <Label htmlFor={`${intern.name}-late`}>Late</Label>
                          </div>
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No interns found.
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
