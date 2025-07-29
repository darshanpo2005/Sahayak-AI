
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">NWCS Internship Portal</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your central hub for managing internships at Bharat Electronics Limited.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
          <div className="w-full flex flex-col items-center p-8 border rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                <Shield className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold mb-2">For Managers</h2>
             <p className="text-muted-foreground text-center mb-6 h-12">Manage interns, track progress, and create resources.</p>
             <Link href="/management/login" className="w-full">
                <Button variant="outline" className="w-full">
                    Manager Login <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </Link>
          </div>
           <div className="w-full flex flex-col items-center p-8 border rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                <GraduationCap className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold mb-2">For Interns</h2>
             <p className="text-muted-foreground text-center mb-6 h-12">Access resources, take quizzes, and track your progress.</p>
             <Link href="/student/login" className="w-full">
                <Button variant="outline" className="w-full">
                    Intern Login <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
             </Link>
          </div>
        </div>
      </div>
    </>
  );
}
