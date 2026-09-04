"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { MobileNav } from "./MobileNav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getNavItems, UserRole } from "@/lib/navigation"
import { 
  LayoutDashboard, FileText, BookOpen, TrendingUp, Bell, User,
  Lightbulb, MessageSquare, Calendar, Folder, Users, FileCheck, 
  BookCheck, BarChart, UserCheck, UserPlus, CalendarDays, Building, 
  Megaphone, Settings, GraduationCap, X, LogOut
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  let role = session?.user?.role?.toLowerCase() || "student"
  if (pathname.startsWith("/supervisor")) role = "supervisor"
  else if (pathname.startsWith("/admin")) role = "admin"
  else if (pathname.startsWith("/student")) role = "student"

  const navItems = getNavItems(role as "admin" | "supervisor" | "student")

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      
      <div className="flex flex-1 flex-col sm:gap-4 md:py-0 w-full">
        <Topbar onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />
        
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:p-8 max-w-[1600px] mx-auto w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
      
      <MobileNav />

      {/* Mobile Slide-out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-card border-r h-full shadow-2xl z-10 p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b">
              <Link 
                href="/" 
                className="flex items-center gap-2 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">SuperSync</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || GraduationCap
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                  <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

