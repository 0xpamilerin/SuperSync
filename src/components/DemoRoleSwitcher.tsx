"use client"

import * as React from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GraduationCap, Users, Shield, Sparkles, ChevronDown, ChevronUp, RefreshCw, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DEMO_ACCOUNTS = [
  {
    role: "STUDENT" as const,
    label: "Student",
    name: "John Doe",
    email: "student@supersync.edu",
    path: "/student",
    icon: GraduationCap,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    role: "SUPERVISOR" as const,
    label: "Supervisor",
    name: "Dr. Alexander Smith",
    email: "supervisor@supersync.edu",
    path: "/supervisor",
    icon: Users,
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    role: "ADMIN" as const,
    label: "Admin",
    name: "System Admin",
    email: "admin@supersync.edu",
    path: "/admin",
    icon: Shield,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
]

export function DemoRoleSwitcher() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isSwitching, setIsSwitching] = React.useState<string | null>(null)

  const currentRole = session?.user?.role || "GUEST"

  const handleSwitch = async (email: string, targetPath: string, roleName: string) => {
    setIsSwitching(roleName)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: "password123",
      })

      if (res?.ok) {
        router.push(targetPath)
        router.refresh()
      } else {
        console.error("Failed to switch role:", res?.error)
      }
    } catch (err) {
      console.error("Error during role switch:", err)
    } finally {
      setIsSwitching(null)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-sans">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="w-80 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-semibold text-xs tracking-wide uppercase text-foreground">
                Frontend Playground
              </span>
            </div>
            <Badge variant="outline" className="text-[11px] font-mono">
              Role: {currentRole}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground my-2.5">
            Switch mock roles in 1 click with pre-populated datasets:
          </p>

          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon
              const isCurrent = currentRole === acc.role
              const isBusy = isSwitching === acc.label

              return (
                <button
                  key={acc.role}
                  disabled={isBusy}
                  onClick={() => handleSwitch(acc.email, acc.path, acc.label)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/60 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg border ${acc.badgeColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-foreground flex items-center gap-1.5">
                        <span>{acc.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-primary font-semibold">(Active)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{acc.email}</div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isBusy ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Switch &rarr;
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Key className="h-3 w-3" /> Password: <code className="bg-muted px-1 rounded">any</code>
            </span>
            <span className="text-[10px] text-muted-foreground/80">Pure In-Memory Mock</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="rounded-full shadow-lg bg-background/90 backdrop-blur-md border-primary/40 hover:border-primary gap-2 h-9 px-3.5 text-xs font-medium"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Demo: <strong>{currentRole}</strong></span>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}
