import Link from "next/link";
import { ArrowRight, BookOpen, Users, Calendar, CheckCircle, FileText, GraduationCap, Building, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    if (session.user?.role === "ADMIN") redirect("/admin");
    if (session.user?.role === "SUPERVISOR") redirect("/supervisor");
    redirect("/student");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>SuperSync</span>
        </div>
        <nav className="ml-auto flex gap-3 sm:gap-5 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Link className={buttonVariants({ size: "sm" })} href="/login">
            Student Login
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-48 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          
          <div className="container px-4 md:px-6 relative z-10 text-center">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              Transforming Academic Collaboration
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Manage student projects with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">clarity & precision.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
              A comprehensive platform for university students, supervisors, and administrators to seamlessly track, review, and finalize final year projects.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
              {/* Student Portal Card */}
              <div className="flex flex-col p-6 bg-card rounded-2xl border shadow-sm text-left">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Student Portal</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Submit topics, upload chapters, and track your project progress.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/login" className={buttonVariants({ className: "w-full" })}>
                    Login
                  </Link>
                  <Link href="/register" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Supervisor Portal Card */}
              <div className="flex flex-col p-6 bg-card rounded-2xl border shadow-sm text-left">
                <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 text-accent-foreground">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Supervisor Portal</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Review student chapters, approve topics, and manage meetings.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/supervisor-login" className={buttonVariants({ className: "w-full" })}>
                    Login
                  </Link>
                  <Link href="/supervisor-register" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Admin Portal Card */}
              <div className="flex flex-col p-6 bg-card rounded-2xl border shadow-sm text-left">
                <div className="p-3 bg-destructive/10 rounded-lg w-fit mb-4 text-destructive">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Administration</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  Manage sessions, departments, and oversee all system activities.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/admin-login" className={buttonVariants({ className: "w-full" })}>
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 border-t border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything you need to succeed</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-lg">
                Our platform bridges the gap between students and supervisors, ensuring constant communication, clear milestones, and organized file management.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FeatureCard 
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
                title="Progress Tracking"
                description="Visual milestones from topic submission to final defense. Know exactly where your project stands."
              />
              <FeatureCard 
                icon={<FileText className="h-10 w-10 text-primary" />}
                title="Document Management"
                description="Securely upload chapters and project files. Maintain a complete history of revisions."
              />
              <FeatureCard 
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Real-time Feedback"
                description="Supervisors can leave inline comments and review chapters quickly, eliminating email chains."
              />
              <FeatureCard 
                icon={<Calendar className="h-10 w-10 text-primary" />}
                title="Meeting Scheduling"
                description="Schedule, track, and log meeting notes between students and supervisors easily."
              />
              <FeatureCard 
                icon={<BookOpen className="h-10 w-10 text-primary" />}
                title="Topic Approval Workflow"
                description="Streamlined digital workflows for submitting and approving project topics."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6 bg-background">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 SuperSync. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">Terms of Service</Link>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md">
      <div className="p-3 bg-primary/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
