
"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Zap, BookOpen, BarChart, Twitter, Linkedin, Github, Sun, Moon, Monitor } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { setTheme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="flex items-center justify-start gap-2">
            <Image src="/logo.png" alt="NWCS Portal Logo" width={24} height={24} className="h-6 w-6" />
            <span className="font-bold">NWCS Portal</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
             <Link href="/management/login">
                <Button variant="ghost">Manager Login</Button>
            </Link>
             <Link href="/student/login">
                <Button>Intern Login</Button>
             </Link>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                   <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 sm:py-32 md:py-40">
          <div className="container text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Empowering the Next Wave of Innovators
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              Welcome to the NWCS Internship Portal at Bharat Electronics Limited. Your journey towards excellence in Networking and Cyber-Security starts here.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg">Get Started</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/management/login">Manager Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/student/login">Intern Login</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Portal Features</h2>
              <p className="text-muted-foreground mt-2">Everything you need for a successful internship.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <Zap className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">AI-Powered Tools</h3>
                <p className="text-muted-foreground">Utilize AI for generating quizzes, flashcards, and assignments, making learning and management more efficient.</p>
              </Card>
              <Card>
                <BookOpen className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Resource Management</h3>
                <p className="text-muted-foreground">Access all your learning materials, project guidelines, and important documents in one centralized place.</p>
              </Card>
              <Card>
                <BarChart className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">Stay updated with real-time tracking of quiz scores, attendance, and overall performance throughout the internship.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="BEL Team" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-lg"
                data-ai-hint="team collaboration"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">About the NWCS Internship Program</h2>
              <p className="mt-4 text-muted-foreground">
                The Networking and Cyber-Security (NWCS) internship at Bharat Electronics Limited (BEL) is a premier program designed to cultivate top talent in the field of national defense and technology. We provide a challenging and rewarding environment where interns can work on cutting-edge projects, learn from experienced mentors, and contribute to the security and technological advancement of the nation.
              </p>
               <p className="mt-4 text-muted-foreground">
                This portal is your gateway to a successful internship experience, providing all the tools and resources you need to learn, grow, and excel.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Bharat Electronics Limited. All rights reserved.</p>
           <div className="flex items-center gap-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
               <Link href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
               <Link href="#" aria-label="GitHub">
                <Github className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

// Custom Card component for the features section
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background p-6 rounded-lg border shadow-sm">
      {children}
    </div>
  )
}
