"use client"


import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { registerUser } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/ThemeToggle"

const registerSchema = z.object({
  role: z.literal("SUPERVISOR"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  departmentId: z.string().min(1, "Please select a department"),
  staffId: z.string().min(1, "Staff ID is required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>

export default function SupervisorRegisterClient({ 
  departments 
}: { 
  departments: { id: string, name: string, code: string }[]
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "SUPERVISOR",
      name: "",
      email: "",
      password: "",
      departmentId: "",
      staffId: "",
    },
  })

  const selectedDept = watch("departmentId")

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append("role", data.role)
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("departmentId", data.departmentId)
      formData.append("staffId", data.staffId)

      const result = await registerUser(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/supervisor-login")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Building className="h-8 w-8 text-accent-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Registration Successful!</h2>
          <p className="text-muted-foreground">Your account has been created successfully. Redirecting you to login...</p>
        </div>
      </div>
    )
  }

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
              <Building className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Supervisor Portal</h2>
            <p className="text-indigo-100 text-lg">
              Create an account to manage your assigned students, review their project chapters, and approve final submissions.
            </p>
          </div>
        </div>
      </div>
      
      <div className="lg:p-8 flex h-screen items-center justify-center p-4 bg-background overflow-y-auto">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] py-10">
          <div className="rounded-2xl border bg-card text-card-foreground shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex flex-col p-8 pb-4 space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Create a Supervisor account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your staff details to register for the system
              </p>
            </div>
            
            <div className="p-8 pt-4">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center font-medium">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-semibold">Full Name</Label>
                    <Input id="name" disabled={isLoading} {...register("name")} className="focus-visible:ring-[#4F46E5]" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-semibold">Staff Email</Label>
                    <Input id="email" type="email" placeholder="name@ui.edu.ng" disabled={isLoading} {...register("email")} className="focus-visible:ring-[#4F46E5]" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="font-semibold">Password</Label>
                    <Input id="password" type="password" disabled={isLoading} {...register("password")} className="focus-visible:ring-[#4F46E5]" />
                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-semibold">Department</Label>
                    <Select disabled={isLoading} value={selectedDept} onValueChange={(val) => setValue("departmentId", val as string)}>
                      <SelectTrigger className={cn("focus:ring-[#4F46E5]", errors.departmentId && "border-red-500 focus:ring-red-500")}>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name} ({dept.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="staffId" className="font-semibold">Staff ID</Label>
                    <Input id="staffId" disabled={isLoading} {...register("staffId")} className="focus-visible:ring-[#4F46E5]" />
                    {errors.staffId && <p className="text-xs text-red-500">{errors.staffId.message}</p>}
                  </div>

                  <Button type="submit" disabled={isLoading} className="mt-4 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Supervisor Account
                  </Button>
                </div>
              </form>
            </div>
            <div className="flex items-center p-8 pt-0 justify-center mt-4">
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/supervisor-login" className="font-semibold text-[#4F46E5] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
