"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  LogOut,
  Settings,
  User,
  Loader2,
  LayoutDashboard,
  Users2,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  Copy,
  Lightbulb,
  HelpCircle,
  BarChart3,
  Shield,
  CreditCard,
} from "lucide-react";
import { logout, getSession } from "@/lib/authService";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type Session = {
  user: { name: string; email: string };
  role: "student" | "teacher" | "admin";
} | null;

const studentNavItems = [
  { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/flashcards", icon: Copy, label: "Flashcards" },
];

const teacherNavItems = [
  { href: "/teacher", icon: LayoutDashboard, label: "Dashboard" },
];

const managementNavItems = [
    { href: "/management", icon: LayoutDashboard, label: "Dashboard" },
];


export function DashboardPage({
  children,
  title,
  role,
}: {
  children: React.ReactNode;
  title: string;
  role: "Management" | "Teacher" | "Student";
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || (role.toLowerCase() !== 'management' && currentSession.role !== role.toLowerCase())) {
        logout();
        if (role === 'Student') router.push('/student/login');
        if (role === 'Teacher') router.push('/teacher/login');
        if (role === 'Management') router.push('/');
    } else {
        setSession(currentSession as Session);
    }
    setIsLoading(false);
  }, [role, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  
  const getProfileLink = () => {
    if (role === "Student") return "/profile/student";
    if (role === "Teacher") return "/profile/teacher";
    return "#";
  }

  const getSettingsLink = () => {
    if (role === "Student") return "/settings/student";
    if (role === "Teacher") return "/settings/teacher";
    return "#";
  }

  const getNavItems = () => {
      switch(role) {
          case 'Student': return studentNavItems;
          case 'Teacher': return teacherNavItems;
          case 'Management': return managementNavItems;
          default: return [];
      }
  }

  if (isLoading || !session) {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader>
           <div className="flex items-center gap-2 p-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg whitespace-nowrap">Sahayak AI</span>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {getNavItems().map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            {role !== 'Management' && (
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile">
                    <Link href={getProfileLink()}>
                        <User/>
                        <span>Profile</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
             {role !== 'Management' && (
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                    <Link href={getSettingsLink()}>
                        <Settings/>
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
            {role !== 'Management' && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${session?.user?.name?.charAt(0)}`} alt="User" data-ai-hint="user avatar" />
                        <AvatarFallback>{session?.user?.name?.charAt(0) || role.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.name || `${role} User`}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session?.user?.email || `${role.toLowerCase()}@sahayak.com`}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href={getProfileLink()}><User className="mr-2 h-4 w-4" />Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href={getSettingsLink()}><Settings className="mr-2 h-4 w-4" />Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                       <LogOut className="mr-2 h-4 w-4" />Logout
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in-25 duration-300">
            <div className="max-w-7xl mx-auto">
             {children}
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
