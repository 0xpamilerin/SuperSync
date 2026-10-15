"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, getSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "student@supersync.edu",
      password: "password123",
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      const session = await getSession()
      const role = session?.user?.role?.toUpperCase()

      if (role === "ADMIN") {
        router.push("/admin")
      } else if (role === "SUPERVISOR") {
        router.push("/supervisor")
      } else if (role === "STUDENT") {
        router.push("/student")
      } else {
        router.push("/")
      }
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const rememberMe = watch("rememberMe")

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute right-4 top-4 md:right-8 md:top-8 z-30">
        <ThemeToggle />
      </div>
      <div className="relative hidden h-full w-full bg-[#4F46E5] lg:block">
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.15) 2px, transparent 0)",
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="flex flex-col items-center text-center space-y-6 max-w-sm">
            <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Academic Portal</h2>
            <p className="text-indigo-100 text-lg">
              Streamlining your educational experience with a modern, intuitive, and secure management platform.
            </p>
          </div>
        </div>
      </div>
      
      <div className="lg:p-8 flex h-screen items-center justify-center p-4 bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="rounded-2xl border bg-card text-card-foreground shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex flex-col p-8 pb-4 space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your dashboard
              </p>
            </div>
            
            <div className="p-8 pt-4">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center font-medium">
                  {error}
                </div>
              )}
              
              <div className="grid gap-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between gap-1 p-1.5 bg-muted/60 rounded-lg text-xs border border-border/70">
                      <span className="text-muted-foreground text-[11px] font-medium pl-1">Demo login:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setValue("email", "student@supersync.edu")
                            setValue("password", "password123")
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-background hover:bg-primary hover:text-primary-foreground text-foreground border shadow-xs transition-colors"
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setValue("email", "supervisor@supersync.edu")
                            setValue("password", "password123")
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-background hover:bg-primary hover:text-primary-foreground text-foreground border shadow-xs transition-colors"
                        >
                          Supervisor
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email" className="font-semibold">Email</Label>
                      <Input
                        id="email"
                        placeholder="name@ui.edu.ng"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...register("email")}
                        className={cn("focus-visible:ring-[#4F46E5]", errors.email && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="font-semibold">Password</Label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-[#4F46E5] hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...register("password")}
                          className={cn(
                            "pr-10 focus-visible:ring-[#4F46E5]",
                            errors.password && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </Label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="mt-4 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Sign In
                    </Button>
                  </div>
                </form>

              </div>
            </div>
            <div className="flex flex-col items-center p-8 pt-0 justify-center space-y-3">
              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[#4F46E5] underline underline-offset-4 hover:text-[#4338CA]"
                >
                  Create Student Account
                </Link>
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t w-full justify-center">
                <span>Are you a supervisor?</span>
                <Link href="/supervisor-login" className="text-[#4F46E5] hover:underline font-medium">
                  Supervisor Portal &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Discreet Footer Link for System Administration */}
          <footer className="text-center text-xs text-muted-foreground">
            <p>
              University Staff or Administrator?{" "}
              <Link
                href="/admin-login"
                className="font-medium text-foreground hover:text-primary underline underline-offset-4 transition-colors"
              >
                Admin Portal &rarr;
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
