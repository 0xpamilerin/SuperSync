"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, Save, Shield, User, History, Check, Palette, Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { updateProfile, updatePassword } from "@/app/actions/profile"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  department: z.string().min(2, "Department is required."),
})

const securitySchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function ProfileClient({ userProfile }: { userProfile: any }) {
  const [isSaving, setIsSaving] = React.useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const departmentName = userProfile.studentProfile?.department?.name || 
                         userProfile.supervisorProfile?.department?.name || 
                         "Admin"
  
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      department: departmentName,
    },
  })

  const { register: registerSecurity, handleSubmit: handleSubmitSecurity, reset: resetSecurity, formState: { errors: securityErrors } } = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSaveProfile(data: any) {
    setIsSaving(true)
    const result = await updateProfile({ name: data.name })
    if (result.success) {
      toast({ title: "Success", description: "Profile updated successfully." })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  async function onSaveSecurity(data: any) {
    setIsSaving(true)
    const result = await updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
    if (result.success) {
      toast({ title: "Success", description: "Password updated successfully." })
      resetSecurity()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your account settings, security credentials, and theme preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md h-10 p-1">
          <TabsTrigger value="general" className="flex items-center justify-center gap-1.5 py-1.5 text-xs sm:text-sm font-medium">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-1.5 py-1.5 text-xs sm:text-sm font-medium">
            <Shield className="h-4 w-4 shrink-0" />
            <span className="truncate">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center justify-center gap-1.5 py-1.5 text-xs sm:text-sm font-medium">
            <Palette className="h-4 w-4 shrink-0" />
            <span className="truncate">Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-4 sm:mt-6">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Update your personal identification details here.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-2">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-border/60 shadow-sm shrink-0">
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {userProfile.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center sm:text-left">
                  <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                    <Camera className="mr-2 h-4 w-4" /> Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">Profile photo upload coming soon.</p>
                </div>
              </div>

              <form id="profile-form" onSubmit={handleSubmitProfile(onSaveProfile)} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input id="name" {...registerProfile("name")} className={cn("h-10", profileErrors.name && "border-destructive")} />
                  {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message as string}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input id="email" type="email" disabled {...registerProfile("email")} className="h-10 bg-muted/50 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Email is tied to your university account and cannot be modified.</p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input id="department" disabled {...registerProfile("department")} className="h-10 bg-muted/50 cursor-not-allowed" />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button type="submit" form="profile-form" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 sm:mt-6">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Update your password to keep your academic account secure.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form id="security-form" onSubmit={handleSubmitSecurity(onSaveSecurity)} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...registerSecurity("currentPassword")} className={cn("h-10", securityErrors.currentPassword && "border-destructive")} />
                  {securityErrors.currentPassword && <p className="text-xs text-destructive">{securityErrors.currentPassword.message as string}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...registerSecurity("newPassword")} className={cn("h-10", securityErrors.newPassword && "border-destructive")} />
                  {securityErrors.newPassword && <p className="text-xs text-destructive">{securityErrors.newPassword.message as string}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...registerSecurity("confirmPassword")} className={cn("h-10", securityErrors.confirmPassword && "border-destructive")} />
                  {securityErrors.confirmPassword && <p className="text-xs text-destructive">{securityErrors.confirmPassword.message as string}</p>}
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button type="submit" form="security-form" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 sm:mt-6">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Appearance & Theme</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Customize how SuperSync looks on your device. Choose light, dark, or sync with your system preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Light Theme Option */}
                <div
                  onClick={() => setTheme("light")}
                  className={cn(
                    "group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all hover:border-primary",
                    mounted && theme === "light"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-accent/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>Light</span>
                    </div>
                    {mounted && theme === "light" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {/* Visual Preview */}
                  <div className="rounded-lg border bg-[#f8fafc] p-2 space-y-1.5 shadow-inner">
                    <div className="h-2 w-1/3 rounded bg-slate-300" />
                    <div className="flex gap-1.5">
                      <div className="h-10 w-1/4 rounded bg-slate-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 rounded bg-white border border-slate-200" />
                        <div className="h-4 rounded bg-white border border-slate-200" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Clean, bright daytime experience with soft neutral backgrounds.
                  </p>
                </div>

                {/* Dark Theme Option */}
                <div
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all hover:border-primary",
                    mounted && theme === "dark"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-accent/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Moon className="h-4 w-4 text-indigo-400" />
                      <span>Dark</span>
                    </div>
                    {mounted && theme === "dark" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {/* Visual Preview */}
                  <div className="rounded-lg border border-slate-800 bg-[#0f172a] p-2 space-y-1.5 shadow-inner">
                    <div className="h-2 w-1/3 rounded bg-slate-700" />
                    <div className="flex gap-1.5">
                      <div className="h-10 w-1/4 rounded bg-slate-800" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 rounded bg-slate-800/80 border border-slate-700/50" />
                        <div className="h-4 rounded bg-slate-800/80 border border-slate-700/50" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    High-contrast midnight slate palette that reduces eye fatigue.
                  </p>
                </div>

                {/* System Preference Option */}
                <div
                  onClick={() => setTheme("system")}
                  className={cn(
                    "group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all hover:border-primary",
                    mounted && theme === "system"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-accent/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span>System</span>
                    </div>
                    {mounted && theme === "system" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {/* Visual Preview */}
                  <div className="grid grid-cols-2 gap-1.5 rounded-lg border bg-muted/40 p-1.5 shadow-inner">
                    <div className="rounded border bg-[#f8fafc] p-1.5 space-y-1">
                      <div className="h-1.5 w-1/2 rounded bg-slate-300" />
                      <div className="flex gap-1">
                        <div className="h-6 w-1/3 rounded bg-slate-200" />
                        <div className="flex-1 space-y-0.5">
                          <div className="h-2.5 rounded bg-white border border-slate-200" />
                          <div className="h-2.5 rounded bg-white border border-slate-200" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded border border-slate-800 bg-[#0f172a] p-1.5 space-y-1">
                      <div className="h-1.5 w-1/2 rounded bg-slate-700" />
                      <div className="flex gap-1">
                        <div className="h-6 w-1/3 rounded bg-slate-800" />
                        <div className="flex-1 space-y-0.5">
                          <div className="h-2.5 rounded bg-slate-800 border border-slate-700/50" />
                          <div className="h-2.5 rounded bg-slate-800 border border-slate-700/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Automatically syncs with your operating system display settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
