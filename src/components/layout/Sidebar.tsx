"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getNavItems, currentUser } from "@/lib/mock-data"
import { 
  LayoutDashboard, FileText, BookOpen, TrendingUp, ChevronLeft, ChevronRight, GraduationCap,
  User, Lightbulb, MessageSquare, Calendar, Folder, Bell, Users, FileCheck, BookCheck, BarChart, 
  UserCheck, UserPlus, CalendarDays, Building, Megaphone, Settings
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

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Use session role, fallback to path-based detection if loading
  let role = session?.user?.role?.toLowerCase() || currentUser.role
  
  if (pathname.startsWith("/supervisor")) role = "supervisor"
  else if (pathname.startsWith("/admin")) role = "admin"
  else if (pathname.startsWith("/student")) role = "student"
  
  const navItems = getNavItems(role as "admin" | "supervisor" | "student")

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out hidden md:flex",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          {!isCollapsed && <span className="truncate">SPMS</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.title}</span>}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
