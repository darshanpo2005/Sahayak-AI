
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Choose Your Role</h1>
        <p className="text-muted-foreground mt-2">Select your login method to access the portal.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/management/login">
          <Card className="hover:border-primary transition-colors duration-300 transform hover:-translate-y-1">
            <CardHeader className="items-center text-center">
              <Shield className="w-16 h-16 mb-4 text-primary" />
              <CardTitle className="text-2xl">Manager Login</CardTitle>
              <CardDescription>
                Access the management dashboard, oversee interns, and manage resources.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/student/login">
          <Card className="hover:border-primary transition-colors duration-300 transform hover:-translate-y-1">
            <CardHeader className="items-center text-center">
              <GraduationCap className="w-16 h-16 mb-4 text-primary" />
              <CardTitle className="text-2xl">Intern Login</CardTitle>
              <CardDescription>
                Access your resources, submit quizzes, and track your progress.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      <div className="mt-12">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
