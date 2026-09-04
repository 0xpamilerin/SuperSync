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
  Megaphone, Settings
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

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  let role = session?.user?.role?.toLowerCase() || "student"
  if (pathname.startsWith("/supervisor")) role = "supervisor"
  else if (pathname.startsWith("/admin")) role = "admin"
  else if (pathname.startsWith("/student")) role = "student"
  
  const navItems = getNavItems(role as "admin" | "supervisor" | "student")

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background px-2 pb-safe">
      {navItems.slice(0, 4).map((item) => {
        const Icon = iconMap[item.icon]
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 rounded-md px-3 py-2 text-xs font-medium",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        )
      })}
      
      <Link
        href="/notifications"
        className={cn(
          "flex flex-col items-center justify-center space-y-1 rounded-md px-3 py-2 text-xs font-medium",
          pathname === "/notifications" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Bell className="h-5 w-5" />
        <span>Alerts</span>
      </Link>
      
      <Link
        href="/profile"
        className={cn(
          "flex flex-col items-center justify-center space-y-1 rounded-md px-3 py-2 text-xs font-medium",
          pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="h-5 w-5" />
        <span>Profile</span>
      </Link>
    </nav>
  )
}
