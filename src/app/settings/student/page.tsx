"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, Palette, Lock, Moon, Sun, Monitor, Loader2, Paintbrush } from "lucide-react";
import { useTheme } from "next-themes";
import { getSession, setSession as setAuthSession } from "@/lib/authService";
import { updateStudentPassword, updateStudentTheme } from "@/lib/services";
import type { Student, Theme } from "@/lib/services";
import { cn } from "@/lib/utils";

export default function StudentSettingsPage() {
  const { toast } = useToast();
  const { setTheme: setDarkMode } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTheme, setActiveTheme] = useState<Theme>('default');

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== 'student') {
        router.push('/student/login');
    } else {
        const studentSession = currentSession as { user: Student; role: 'student' };
        setSession(studentSession);
        setActiveTheme(studentSession.user.theme || 'default');
    }
    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (activeTheme) {
        document.body.classList.remove('theme-green', 'theme-purple');
        if (activeTheme === 'green') {
            document.body.classList.add('theme-green');
        } else if (activeTheme === 'purple') {
            document.body.classList.add('theme-purple');
        }
    }
  }, [activeTheme]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return false;
    }
    if (!currentPassword || !newPassword) {
      toast({ variant: "destructive", title: "Error", description: "Please fill out all password fields to make a change." });
      return false;
    }
    
    const success = await updateStudentPassword(session!.user.id, currentPassword, newPassword);
    if (success) {
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Incorrect current password. Please try again." });
    }
    return success;
  }

  const handleThemeChange = async () => {
     await updateStudentTheme(session!.user.id, activeTheme);
     const newSession = { ...session!, user: { ...session!.user, theme: activeTheme } };
     setSession(newSession);
     setAuthSession(newSession);
     toast({
        title: "Theme Updated",
        description: "Your new theme has been applied.",
      });
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (newPassword || currentPassword || confirmPassword) {
      await handlePasswordChange();
    }
    await handleThemeChange();

    setIsSaving(false);
  };

  const ThemeButton = ({ theme, color, name }: { theme: Theme, color: string, name: string }) => (
      <Button variant="outline" type="button" onClick={() => setActiveTheme(theme)} className={cn("flex flex-col h-auto py-4", activeTheme === theme && "ring-2 ring-primary")}>
        <div className={cn("w-8 h-8 rounded-full mb-2", color)} /> {name}
      </Button>
  );

  return (
    <DashboardPage title="Settings" role="Student">
      <form onSubmit={handleSaveChanges}>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette /> Display</CardTitle>
              <CardDescription>Choose how Sahayak AI looks and feels.</CardDescription>
            </CardHeader>
            <CardContent>
              {mounted && (
                <div className="space-y-6">
                    <div>
                        <Label className="font-medium text-base">Color Theme</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <ThemeButton theme="default" color="bg-primary" name="Default Blue" />
                          <ThemeButton theme="green" color="bg-[#2a7f53]" name="Forest Green" />
                          <ThemeButton theme="purple" color="bg-[#7c3aed]" name="Royal Purple" />
                        </div>
                    </div>
                    <div>
                        <Label className="font-medium text-base">Appearance</Label>
                         <div className="grid grid-cols-3 gap-4 mt-2">
                          <Button variant="outline" className="flex flex-col h-auto py-4" type="button" onClick={() => setDarkMode("light")}>
                            <Sun className="mb-2" /> Light
                          </Button>
                          <Button variant="outline" className="flex flex-col h-auto py-4" type="button" onClick={() => setDarkMode("dark")}>
                            <Moon className="mb-2" /> Dark
                          </Button>
                          <Button variant="outline" className="flex flex-col h-auto py-4" type="button" onClick={() => setDarkMode("system")}>
                            <Monitor className="mb-2" /> System
                          </Button>
                        </div>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications from the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about grades and announcements via email.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified directly on your device. (Simulated)</p>
                </div>
                <Switch id="push-notifications" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock /> Account</CardTitle>
              <CardDescription>Change your password here. To change your password, you must fill all fields.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
             <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
             </Button>
          </div>
        </div>
      </form>
    </DashboardPage>
  );
}
