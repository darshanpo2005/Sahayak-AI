"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BookUser, GraduationCap, ArrowRight, Loader2, Languages } from "lucide-react";
import { ManagementLoginDialog } from "@/components/auth/login-dialog";
import { getTranslation } from "@/lib/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const initialContent = {
  title: "Sahayak AI",
  description: "A functional prototype of a multi-user AI assistant for educational purposes, demonstrating distinct access levels and AI-powered assistance.",
  roles: [
    {
      name: "Management",
      description: "Full access to manage users, courses, and system settings.",
      buttonText: "Proceed as Management",
    },
    {
      name: "Teacher",
      description: "Manage students, create lesson plans, and generate quizzes.",
      buttonText: "Proceed as Teacher",
    },
    {
      name: "Student",
      description: "Access course materials, take quizzes, and get feedback.",
      buttonText: "Proceed as Student",
    },
  ],
  languageSelector: "Language",
};


export default function Home() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isTranslating, setIsTranslating] = useState(false);

  const rolesConfig = [
    {
      icon: <Shield className="w-10 h-10 text-primary" />,
      action: () => setIsDialogOpen(true),
      isLink: false,
    },
    {
      icon: <BookUser className="w-10 h-10 text-primary" />,
      href: "/teacher/login",
      isLink: true,
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-primary" />,
      href: "/student/login",
      isLink: true,
    },
  ];

  const handleLanguageChange = async (language: string) => {
    if (language === 'en') {
      setContent(initialContent);
      return;
    }

    setIsTranslating(true);
    
    try {
      const textsToTranslate = [
        initialContent.title,
        initialContent.description,
        ...initialContent.roles.flatMap(r => [r.name, r.description, r.buttonText]),
        initialContent.languageSelector,
      ];

      const translationPromises = textsToTranslate.map(text => getTranslation({ text, targetLanguage: language }));
      const translatedTexts = await Promise.all(translationPromises);
      
      let hasFailed = false;
      translatedTexts.forEach(result => {
        if (!result.success) {
            hasFailed = true;
        }
      });

      if (hasFailed) {
        throw new Error("One or more text translations failed.");
      }

      const [
        translatedTitle,
        translatedDescription,
        translatedMgmtName, translatedMgmtDesc, translatedMgmtBtn,
        translatedTeacherName, translatedTeacherDesc, translatedTeacherBtn,
        translatedStudentName, translatedStudentDesc, translatedStudentBtn,
        translatedLangSelector,
      ] = translatedTexts.map(r => r.success ? r.data.translation : "");

      setContent({
        title: translatedTitle,
        description: translatedDescription,
        roles: [
          { name: translatedMgmtName, description: translatedMgmtDesc, buttonText: translatedMgmtBtn },
          { name: translatedTeacherName, description: translatedTeacherDesc, buttonText: translatedTeacherBtn },
          { name: translatedStudentName, description: translatedStudentDesc, buttonText: translatedStudentBtn },
        ],
        languageSelector: translatedLangSelector
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Translation Error",
        description: "Failed to translate the page content.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 animate-in fade-in duration-500">
        <header className="absolute top-4 right-4 flex items-center gap-2">
            {isTranslating && <Loader2 className="w-5 h-5 animate-spin" />}
            <Select onValueChange={handleLanguageChange} defaultValue="en" disabled={isTranslating}>
                <SelectTrigger className="w-[180px]">
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={content.languageSelector} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
            </Select>
        </header>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary tracking-tight">{content.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {content.roles.map((role, index) => {
            const config = rolesConfig[index];
            const cardContent = (
              <Card className="text-center h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
                <CardHeader>
                  <div className="flex justify-center mb-4">{config.icon}</div>
                  <CardTitle className="text-2xl font-semibold">{role.name}</CardTitle>
                  <CardDescription className="mt-2 h-12">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant={config.isLink ? "outline" : "default"} className="w-full" onClick={config.isLink ? undefined : config.action}>
                    {role.buttonText} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );

            return config.isLink ? (
              <Link href={config.href!} key={role.name} className="h-full">
                {cardContent}
              </Link>
            ) : (
              <div key={role.name} className="cursor-pointer" onClick={config.action}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
      <ManagementLoginDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
