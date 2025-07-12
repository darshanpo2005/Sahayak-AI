
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Loader2, BarChart3, User, BookOpen } from "lucide-react";
import { getCoursesForTeacher, getStudentsForTeacher, getQuizResultsForCourse, Course, Student, Teacher, QuizResultRecord } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { StudentProgressChart } from "@/components/analytics/student-progress-chart";

export default function TeacherAnalyticsPage() {
    const { toast } = useToast();
    const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [quizResults, setQuizResults] = useState<QuizResultRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    
    useEffect(() => {
        const currentSession = getSession();
        if (currentSession?.role === 'teacher') {
            setSession(currentSession as { user: Teacher; role: 'teacher' });
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!session) return;
            setIsLoading(true);
            try {
                const [coursesData, studentsData] = await Promise.all([
                    getCoursesForTeacher(session.user.id),
                    getStudentsForTeacher(session.user.id),
                ]);
                setCourses(coursesData);
                setStudents(studentsData);
                 if (coursesData.length > 0) {
                    handleCourseChange(coursesData[0].id);
                }
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Failed to load initial data." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [session, toast]);

    const handleCourseChange = async (courseId: string) => {
        setSelectedCourse(courseId);
        if (!courseId) {
            setQuizResults([]);
            return;
        };
        setIsLoadingResults(true);
        try {
            const resultsData = await getQuizResultsForCourse(courseId);
            setQuizResults(resultsData);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load quiz results." });
        } finally {
            setIsLoadingResults(false);
        }
    }
    
    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown Student';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3/> Student Analytics</CardTitle>
                    <CardDescription>Review student performance and quiz results by course.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Select onValueChange={handleCourseChange} value={selectedCourse} disabled={isLoading}>
                        <SelectTrigger className="max-w-sm">
                            <SelectValue placeholder="Select a course..." />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                            ) : (
                                courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)
                            )}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {isLoading || isLoadingResults ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : quizResults.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Class Average</CardTitle>
                            <CardDescription>Average score across all submitted quizzes for this course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StudentProgressChart data={quizResults} />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Individual Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizResults.map(result => (
                                        <TableRow key={result.studentId}>
                                            <TableCell className="font-medium">{getStudentName(result.studentId)}</TableCell>
                                            <TableCell className="text-right">{result.score} / {result.total}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                 <Card className="text-center py-16">
                    <CardContent>
                        <p className="text-muted-foreground">No quiz results found for this course yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">Make sure you have generated a quiz and students have submitted their answers.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
