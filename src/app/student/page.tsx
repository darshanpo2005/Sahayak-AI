"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, MessageSquare, Send, Bot, Loader2 } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentPage() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ author: "user" | "bot"; message: string }[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);

  const courses = [
    {
      title: "Introduction to Algebra",
      content: "Module 1: Variables and Expressions\nModule 2: Solving Linear Equations\nModule 3: Graphing Functions",
    },
    {
      title: "World History: Ancient Civilizations",
      content: "Module 1: Mesopotamia\nModule 2: Ancient Egypt\nModule 3: The Roman Empire",
    },
    {
      title: "Fundamentals of Biology",
      content: "Module 1: Cell Structure\nModule 2: Photosynthesis\nModule 3: Genetics",
    },
  ];

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newHistory = [...chatHistory, { author: "user" as const, message: question }];
    setChatHistory(newHistory);
    setQuestion("");
    setIsAnswering(true);

    setTimeout(() => {
      const cannedResponse = "This is a simulated response from Sahayak AI. In a full application, I would provide a detailed answer based on your course materials. For example, Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.";
      setChatHistory([...newHistory, { author: "bot" as const, message: cannedResponse }]);
      setIsAnswering(false);
    }, 1500);
  };

  return (
    <DashboardPage title="Student Dashboard" role="Student">
      <Tabs defaultValue="courses">
        <TabsList className="mb-6">
          <TabsTrigger value="courses"><Book className="mr-2 h-4 w-4" />Course Materials</TabsTrigger>
          <TabsTrigger value="qna"><MessageSquare className="mr-2 h-4 w-4" />Ask a Question</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Access your enrolled courses and materials here. (Simulated Data)</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {courses.map((course, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-medium">{course.title}</AccordionTrigger>
                    <AccordionContent>
                      <pre className="p-4 bg-muted/50 rounded-md whitespace-pre-wrap font-sans">{course.content}</pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qna">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>Get help with your course content from Sahayak AI. (Simulated Response)</CardDescription>
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
                       <div className={`rounded-lg px-4 py-2 max-w-[75%] ${chat.author === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
                  placeholder="Ask about your course..."
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
