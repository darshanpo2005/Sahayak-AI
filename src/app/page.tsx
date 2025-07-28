
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  const rolesConfig = [
    {
      name: "Manager",
      description: "Full access to manage interns, schedules, resources, and events.",
      buttonText: "Proceed as Manager",
      icon: <Shield className="w-10 h-10 text-primary" />,
      href: "/management",
    },
    {
      name: "Intern",
      description: "Access schedule, resources, events, and submit queries.",
      buttonText: "Proceed as Intern",
      icon: <GraduationCap className="w-10 h-10 text-primary" />,
      href: "/student",
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary tracking-tight">NWCS Internship Portal</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A portal for interns at BEL to manage schedules, resources, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {rolesConfig.map((role) => (
            <Link href={role.href} key={role.name} className="h-full">
              <Card className="text-center h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
                <CardHeader>
                  <div className="flex justify-center mb-4">{role.icon}</div>
                  <CardTitle className="text-2xl font-semibold">{role.name}</CardTitle>
                  <CardDescription className="mt-2 h-12">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {role.buttonText} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
