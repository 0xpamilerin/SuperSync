"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { getNavItems, UserRole } from "@/lib/navigation"
import { 
  LayoutDashboard, FileText, BookOpen, TrendingUp, Bell, User,
  Lightbulb, MessageSquare, Calendar, Folder, Users, FileCheck, 
  BookCheck, BarChart, UserCheck, UserPlus, CalendarDays, Building, 
  Megaphone, Settings, GraduationCap
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  BookOpen,
  TrendingUp,
  User,
  Lightbulb,
  MessageSquare,
  Calendar,
  Folder,
  Bell,
  Users,
  FileCheck,
  BookCheck,
  BarChart,
  UserCheck,
  UserPlus,
  CalendarDays,
  Building,
  Megaphone,
  Settings,
}

const shortTitles: Record<string, string> = {
  "Project Topics": "Topics",
  "Project Proposal": "Proposal",
  "Supervisor Feedback": "Feedback",
  "Progress Tracker": "Progress",
  "Topic Reviews": "Topics",
  "Proposal Reviews": "Proposals",
  "Chapter Reviews": "Chapters",
  "Academic Sessions": "Sessions",
  "System Settings": "Settings",
}

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  let role = session?.user?.role?.toLowerCase() || "student"
  if (pathname.startsWith("/supervisor")) role = "supervisor"
  else if (pathname.startsWith("/admin")) role = "admin"
  else if (pathname.startsWith("/student")) role = "student"
  
  const navItems = getNavItems(role as "admin" | "supervisor" | "student")

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-1 pb-safe shadow-lg">
      {navItems.slice(0, 3).map((item) => {
        const Icon = iconMap[item.icon] || GraduationCap
        const isActive = pathname === item.href
        const label = shortTitles[item.title] || item.title

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors",
              isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 mb-0.5 shrink-0" />
            <span className="truncate max-w-[62px] text-center">{label}</span>
          </Link>
        )
      })}
      
      <Link
        href="/notifications"
        className={cn(
          "flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-medium transition-colors",
          pathname === "/notifications" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Bell className="h-5 w-5 mb-0.5 shrink-0" />
        <span className="truncate max-w-[62px] text-center">Alerts</span>
      </Link>
      
      <Link
        href="/profile"
        className={cn(
          "flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-medium transition-colors",
          pathname === "/profile" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="h-5 w-5 mb-0.5 shrink-0" />
        <span className="truncate max-w-[62px] text-center">Profile</span>
      </Link>
    </nav>
  )
}
