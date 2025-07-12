
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Book,
  Home,
  LogOut,
  Settings,
  User,
  Shield,
  BookUser,
  GraduationCap,
  LayoutDashboard,
  HelpCircle,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Lightbulb,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSession, logout } from "@/lib/authService";
import type { Student, Teacher } from "@/lib/services";

type Session = {
  user: Student | Teacher;
  role: "student" | "teacher";
} | null;

type DashboardLayoutProps = {
  children: React.ReactNode;
  role: "student" | "teacher" | "management";
};

const navItems = {
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "My Courses", icon: Book },
    { href: "/student/quizzes", label: "Quizzes", icon: HelpCircle },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/student/tutor", label: "AI Tutor", icon: MessageSquare },
    { href: "/student/fees", label: "Fee Payment", icon: CreditCard },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/teacher/attendance",
      label: "Take Attendance",
      icon: CalendarCheck,
    },
    { href: "/teacher/planner", label: "Lesson Planner", icon: Lightbulb },
    { href: "/teacher/quiz-gen", label: "Quiz Generator", icon: HelpCircle },
    {
      href: "/teacher/analytics",
      label: "Student Analytics",
      icon: BarChart3,
    },
  ],
  management: [{ href: "/management", label: "Dashboard", icon: Shield }],
};

const roleDetails = {
  student: {
    name: "Student",
    icon: GraduationCap,
    profileLink: "/profile/student",
    settingsLink: "/settings/student",
  },
  teacher: {
    name: "Teacher",
    icon: BookUser,
    profileLink: "/profile/teacher",
    settingsLink: "/settings/teacher",
  },
  management: {
    name: "Management",
    icon: Shield,
    profileLink: "#",
    settingsLink: "#",
  },
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== role) {
      logout(); // Clear any invalid session
      if (role === 'student') router.push("/student/login");
      if (role === 'teacher') router.push("/teacher/login");
      // Management has its own logic in the page for now
    } else {
      setSession(currentSession as Session);
    }
    setIsLoading(false);
  }, [role, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const currentRoleDetails = roleDetails[role];
  const currentNavItems = navItems[role];

  const pageTitle = useMemo(() => {
    const activeItem = currentNavItems.find(item => pathname.startsWith(item.href));
    if (pathname === '/student') return 'Dashboard';
    if (pathname === '/teacher') return 'Dashboard';
    return activeItem?.label || roleDetails[role].name + " Dashboard";
  }, [pathname, currentNavItems, role]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no session for protected roles, we show nothing while redirecting
  if (!session && role !== 'management') {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <currentRoleDetails.icon className="w-6 h-6" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sahayak AI
              </span>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {currentNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={currentRoleDetails.profileLink}>
                <SidebarMenuButton tooltip={{children: "Profile"}}>
                  <User />
                  <span>Profile</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href={currentRoleDetails.settingsLink}>
                <SidebarMenuButton tooltip={{children: "Settings"}}>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Logout"}}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{session?.user?.name}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://placehold.co/100x100.png?text=${session?.user?.name?.charAt(0)}`}
                alt="User"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || role.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in-25 duration-300">
           <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
