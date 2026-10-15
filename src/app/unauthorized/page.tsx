import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function UnauthorizedPage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="absolute right-4 top-4 md:right-8 md:top-8 z-30">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page. Please log in with the appropriate account, or return to your dashboard.
        </p>
        <div className="flex gap-4">
          <Link href="/" className={buttonVariants()}>Return to Dashboard</Link>
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>Log In</Link>
        </div>
      </div>
    </div>
  )
}
