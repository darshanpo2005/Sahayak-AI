
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarCheck, Check, X, Clock } from "lucide-react";
import { getAttendanceForStudent, AttendanceRecord, Student } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { format } from "date-fns";

export default function StudentAttendancePage() {
    const { toast } = useToast();
    const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentSession = getSession();
        if (currentSession?.role === 'student') {
            setSession(currentSession as { user: Student; role: 'student' });
        }
    }, []);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!session) return;
            setIsLoading(true);
            try {
                const data = await getAttendanceForStudent(session.user.id);
                setAttendance(data);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load attendance records." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, [session, toast]);

    const getStatusVariant = (status: AttendanceRecord['status']): "default" | "secondary" | "destructive" => {
        if (status === 'Present') return 'secondary';
        if (status === 'Absent') return 'destructive';
        return 'default';
    }

    const getStatusIcon = (status: AttendanceRecord['status']) => {
        if (status === 'Present') return <Check className="h-4 w-4 text-green-500" />;
        if (status === 'Absent') return <X className="h-4 w-4 text-red-500" />;
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarCheck /> My Attendance</CardTitle>
                <CardDescription>Here is your attendance record for all courses.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
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
                        ) : attendance.length > 0 ? (
                            attendance.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{format(new Date(record.date), "MMMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getStatusVariant(record.status)} className="flex items-center gap-1 w-24 justify-center ml-auto">
                                            {getStatusIcon(record.status)}
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    No attendance records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
