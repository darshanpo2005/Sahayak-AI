
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LogOut,
  Settings,
  User,
  Loader2,
  LayoutDashboard,
  Shield,
  Bell,
  Check,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  Map,
  ClipboardEdit,
  HelpCircle,
  BarChart3,
  BookCheck as GradingIcon,
  Sparkles,
} from "lucide-react";
import { getSession, logout } from "@/lib/clientAuth";
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
} from "@/components/ui/sidebar";
import { getNotificationsForUser, markAllNotificationsAsRead } from "@/lib/notificationService";
import type { Notification } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';


type Session = {
  user: { id: string, name: string; email: string };
  role: "student" | "teacher" | "admin";
} | null;

const internNavItems = [
  { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/quiz", icon: HelpCircle, label: "Quizzes" },
  { href: "/student/flashcards", icon: ClipboardEdit, label: "Flashcards" },
];

const managerNavItems = [
    { href: "/management", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/management/attendance", icon: CalendarCheck, label: "Attendance" },
    { href: "/management/tools", icon: Sparkles, label: "AI Tools" },
    { href: "/management/grading", icon: GradingIcon, label: "Grading Center" },
];


export function DashboardPage({
  children,
  title,
  role,
}: {
  children: React.ReactNode;
  title: string;
  role: "Manager" | "Intern";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (userId: string) => {
    const notifs = await getNotificationsForUser(userId);
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  }

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession?.user?.id) {
        setSession(currentSession as Session);
        fetchNotifications(currentSession.user.id);
    } else if (role === 'Manager' && !currentSession) {
        router.push('/management/login');
    } else if (role === 'Intern' && !currentSession) {
        router.push('/student/login');
    }
    setIsLoading(false);
  }, [role, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  
  const getProfileLink = () => {
    if (role === "Intern") return "/profile/student";
    if (role === "Manager") return "/profile/teacher";
    return "#";
  }

  const getSettingsLink = () => {
    if (role === "Intern") return "/settings/student";
    if (role === "Manager") return "/settings/teacher";
    return "#";
  }

  const getNavItems = () => {
      switch(role) {
          case 'Intern': return internNavItems;
          case 'Manager': return managerNavItems;
          default: return [];
      }
  }

  const handleMarkAllAsRead = async () => {
    if (session?.user.id) {
        await markAllNotificationsAsRead(session.user.id);
        fetchNotifications(session.user.id);
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
        router.push(notification.link);
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
            <span className="font-semibold text-lg whitespace-nowrap text-primary">NWCS Portal</span>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {getNavItems().map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
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
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile" isActive={pathname.startsWith('/profile')}>
                    <Link href={getProfileLink()}>
                        <User/>
                        <span>Profile</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={pathname.startsWith('/settings')}>
                    <Link href={getSettingsLink()}>
                        <Settings/>
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                         <Bell className="h-5 w-5" />
                         {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
                         )}
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end" forceMount>
                        <DropdownMenuLabel>
                            <div className="flex justify-between items-center">
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <Button variant="ghost" size="sm" className="h-auto p-1" onClick={handleMarkAllAsRead}>
                                       <Check className="h-4 w-4 mr-1"/> Mark all as read
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ScrollArea className="h-[300px]">
                            <DropdownMenuGroup>
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <DropdownMenuItem key={n.id} className={cn("flex-col items-start gap-1 whitespace-normal cursor-pointer", !n.read && "bg-accent/50")} onClick={() => handleNotificationClick(n)}>
                                        <p className="font-medium text-sm text-foreground">{n.message}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
                            )}
                            </DropdownMenuGroup>
                       </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${session?.user?.name?.charAt(0) ?? 'A'}`} alt="User" data-ai-hint="user avatar" />
                        <AvatarFallback>{session?.user?.name?.charAt(0) ?? role.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      {session?.user && (
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{session.user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      )}
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
