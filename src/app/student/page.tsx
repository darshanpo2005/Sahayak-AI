"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, MessageSquare, Send, Bot, Loader2, CalendarCheck, Film } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { getTutorResponse } from "@/lib/actions";

type ChatMessage = {
  author: "user" | "bot";
  message: string;
};

export default function StudentPage() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);

  const courses = [
    {
      title: "Introduction to Algebra",
      topic: "Algebra",
      modules: [
        { name: "Variables and Expressions", videoUrl: "https://placehold.co/1280x720.mp4" },
        { name: "Solving Linear Equations", videoUrl: "https://placehold.co/1280x720.mp4" },
        { name: "Graphing Functions", videoUrl: "https://placehold.co/1280x720.mp4" },
      ],
    },
    {
      title: "World History: Ancient Civilizations",
      topic: "World History",
      modules: [
        { name: "Mesopotamia", videoUrl: "https://placehold.co/1280x720.mp4" },
        { name: "Ancient Egypt", videoUrl: "https://placehold.co/1280x720.mp4" },
        { name: "The Roman Empire", videoUrl: "https://placehold.co/1280x720.mp4" },
      ],
    },
  ];

  const [activeCourseTopic, setActiveCourseTopic] = useState(courses[0].topic);
  
  const attendance = [
    { date: "2024-07-22", status: "Present" },
    { date: "2024-07-21", status: "Present" },
    { date: "2024-07-20", status: "Absent" },
    { date: "2024-07-19", status: "Present" },
    { date: "2024-07-18", status: "Late" },
  ];

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { author: "user", message: question }];
    setChatHistory(newHistory);
    const currentQuestion = question;
    setQuestion("");
    setIsAnswering(true);

    const result = await getTutorResponse({
      question: currentQuestion,
      topic: activeCourseTopic,
      history: chatHistory.map(chat => ({ role: chat.author === 'user' ? 'user' : 'model', content: chat.message })),
    });

    if (result.success) {
      setChatHistory([...newHistory, { author: "bot", message: result.data.answer }]);
    } else {
      setChatHistory([...newHistory, { author: "bot", message: `Sorry, I encountered an error: ${result.error}` }]);
    }
    setIsAnswering(false);
  };

  return (
    <DashboardPage title="Student Dashboard" role="Student">
      <Tabs defaultValue="courses">
        <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="courses"><Book className="mr-2 h-4 w-4" />My Courses</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="qna"><MessageSquare className="mr-2 h-4 w-4" />AI Tutor</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Access your enrolled courses, modules, and video lectures here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" onValueChange={(value) => {
                const courseIndex = parseInt(value.split('-')[1]);
                setActiveCourseTopic(courses[courseIndex].topic);
              }}>
                {courses.map((course, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-medium">{course.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                            <Card key={moduleIndex}>
                               <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Film className="h-5 w-5 text-primary" />
                                        {module.name}
                                    </CardTitle>
                               </CardHeader>
                               <CardContent>
                                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                       <p className="text-muted-foreground">Video player placeholder</p>
                                    </div>
                               </CardContent>
                            </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
              <CardDescription>Here is a summary of your attendance record. (Simulated)</CardDescription>
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
                  {attendance.map((record) => (
                    <TableRow key={record.date}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={record.status === "Present" ? "secondary" : record.status === "Absent" ? "destructive" : "default"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qna">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>AI Tutor</CardTitle>
              <CardDescription>Get help with your course content. Currently selected: <span className="font-semibold text-primary">{activeCourseTopic}</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex items-start gap-3 ${chat.author === 'user' ? 'justify-end' : ''}`}>
                      {chat.author === 'bot' && (
                        <Avatar>
                          <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                      )}
                       <div className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-wrap font-sans text-sm ${chat.author === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{chat.message}</p>
                      </div>
                    </div>
                  ))}
                  {isAnswering && (
                     <div className="flex items-start gap-3">
                       <Avatar>
                          <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-3 bg-muted">
                           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                     </div>
                  )}
                  </div>
                </ScrollArea>
            </CardContent>
            <CardHeader className="pt-0">
              <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask about ${activeCourseTopic}...`}
                  disabled={isAnswering}
                />
                <Button type="submit" disabled={isAnswering}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
