"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type DashboardPageProps = {
  children: React.ReactNode;
  title: string;
  role: "Management" | "Teacher" | "Student";
};

export function DashboardPage({ children, title, role }: DashboardPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary">Sahayak AI</span>
          <span className="text-sm font-medium text-muted-foreground">| {role}</span>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Link>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in-25 duration-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
