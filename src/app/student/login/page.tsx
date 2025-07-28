
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginStudent } from "@/lib/authService";
import { Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("intern@bel.com");
  const [password, setPassword] = useState("Intern@NWCS");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const student = await loginStudent(email, password);
      if (student) {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        router.push("/student");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect email or password. Please try again.",
        });
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred during login.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
         <CardHeader className="text-center">
            <Link href="/" className="flex justify-center items-center mb-4 text-primary">
                <GraduationCap className="w-8 h-8 mr-2" />
            </Link>
          <CardTitle>Intern Login</CardTitle>
          <CardDescription>
             Access your NWCS Internship Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="intern@bel.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
