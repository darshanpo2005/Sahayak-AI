
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, MessageSquare, Send, Bot, Loader2, CalendarCheck, Film, Award, Copy, Volume2, Play, Pause, Map } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { getTutorResponse, getCertificate, getAudioForText } from "@/lib/actions";
import { getCourses, Course, Student, notifyTeacherOfQuestion } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";


type ChatMessage = {
  role: "user" | "model";
  content: string;
  audioDataUri?: string;
  isPlaying?: boolean;
};

export default function InternPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [resources, setResources] = useState<Course[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [activeResourceTopic, setActiveResourceTopic] = useState("your resources");
  const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== 'student') {
      router.push('/student/login');
    } else {
      setSession(currentSession as { user: Student; role: 'student' });
    }
  }, [router]);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoadingResources(true);
      try {
        const resourcesData = await getCourses();
        setResources(resourcesData);
        if (resourcesData.length > 0) {
            setActiveResourceTopic(resourcesData[0].title); 
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load resources.",
        });
      } finally {
        setIsLoadingResources(false);
      }
    };
    fetchResources();
  }, [toast]);
  

  const attendance = [
    { date: "2024-07-22", status: "Present" },
    { date: "2024-07-21", status: "Present" },
    { date: "2024-07-20", status: "Absent" },
    { date: "2024-07-19", status: "Present" },
    { date: "2024-07-18", status: "Late" },
  ];

  const handleAudioEnded = () => {
    setChatHistory(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
  };

  const toggleAudio = (index: number) => {
    const message = chatHistory[index];
    if (!message || !message.audioDataUri) return;

    if (message.isPlaying) {
      audioRef.current?.pause();
      setChatHistory(prev => prev.map((msg, i) => i === index ? { ...msg, isPlaying: false } : msg));
    } else {
      // Pause any other playing audio
      audioRef.current?.pause();

      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnded);
      }
      
      const newAudio = new Audio(message.audioDataUri);
      audioRef.current = newAudio;
      newAudio.play();
      
      newAudio.addEventListener('ended', handleAudioEnded);

      setChatHistory(prev => prev.map((msg, i) => ({ ...msg, isPlaying: i === index })));
    }
  };


  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !session) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: question }];
    setChatHistory(newHistory);
    const currentQuestion = question;
    setQuestion("");
    setIsAnswering(true);

    // Notify manager in the background
    notifyTeacherOfQuestion(session.user.id, currentQuestion, activeResourceTopic);

    const result = await getTutorResponse({
      question: currentQuestion,
      topic: activeResourceTopic,
      history: chatHistory,
    });

    if (result.success) {
      const answer = result.data.answer;
      const modelMessage: ChatMessage = { role: "model", content: answer };
      const updatedHistory = [...newHistory, modelMessage];
      setChatHistory(updatedHistory);
      setIsAnswering(false);
      
      setIsGeneratingAudio(true);
      const audioResult = await getAudioForText({ text: answer });

      if (audioResult.success) {
        setChatHistory(prev => prev.map(msg => msg === modelMessage ? {...msg, audioDataUri: audioResult.data.audioDataUri} : msg));
      } else {
         toast({
            variant: "destructive",
            title: "Audio Generation Failed",
            description: audioResult.error,
          });
      }
      setIsGeneratingAudio(false);

    } else {
      setChatHistory([...newHistory, { role: "model", content: `Sorry, I encountered an error: ${result.error}` }]);
      setIsAnswering(false);
    }
  };

  if (!session) {
    return (
       <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <DashboardPage title="Intern Dashboard" role="Intern">
      <Tabs defaultValue="resources">
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="resources"><Book className="mr-2 h-4 w-4" />Resources</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="queries"><MessageSquare className="mr-2 h-4 w-4" />Submit Query</TabsTrigger>
          <TabsTrigger value="map"><Map className="mr-2 h-4 w-4" />Campus Map</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>My Resources</CardTitle>
              <CardDescription>Access your internship resources, documents, and videos here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResources ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full" onValueChange={(value) => {
                    const selectedResource = resources.find(c => c.id === value);
                    if (selectedResource) {
                      setActiveResourceTopic(selectedResource.title);
                    }
                }}>
                  {resources.map((resource) => (
                    <AccordionItem value={resource.id!} key={resource.id}>
                      <AccordionTrigger className="text-lg font-medium">{resource.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                           <p className="text-muted-foreground mb-4">{resource.description}</p>
                          {resource.modules.map((module, moduleIndex) => (
                              <Card key={moduleIndex}>
                                 <CardHeader>
                                      <CardTitle className="text-base flex items-center gap-2">
                                          <Film className="h-5 w-5 text-primary" />
                                          {module}
                                      </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                         <p className="text-muted-foreground">Content placeholder</p>
                                      </div>
                                 </CardContent>
                              </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
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

        <TabsContent value="queries">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Submit Query to Manager</CardTitle>
              <CardDescription>Get help with your internship. A manager will be notified of your question.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={cn('flex items-start gap-3', chat.role === 'user' ? 'justify-end' : '')}>
                      {chat.role === 'model' && (
                         <div className="flex flex-col items-center gap-2">
                           <Avatar>
                             <AvatarFallback><Bot /></AvatarFallback>
                           </Avatar>
                           {chat.audioDataUri && (
                             <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleAudio(index)} disabled={isGeneratingAudio}>
                               {chat.isPlaying ? <Pause className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
                             </Button>
                           )}
                           {isGeneratingAudio && !chat.audioDataUri && <Loader2 className="h-4 w-4 animate-spin"/>}
                         </div>
                      )}
                       <div className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-wrap font-sans text-sm ${chat.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{chat.content}</p>
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
                  placeholder={`Ask about ${activeResourceTopic}...`}
                  disabled={isAnswering}
                />
                <Button type="submit" disabled={isAnswering}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="map">
            <Card>
                <CardHeader>
                    <CardTitle>BEL Campus Map</CardTitle>
                    <CardDescription>A map of the Bharat Electronics Limited campus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                        <Image src="https://placehold.co/800x450.png" alt="BEL Campus Map" layout="fill" objectFit="cover" data-ai-hint="campus map" />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </DashboardPage>
  );
}
