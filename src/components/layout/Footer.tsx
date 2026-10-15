"use client"

import * as React from "react"
import Link from "next/link"
import { 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUp, 
  Lock, 
  Server, 
  ExternalLink,
  Sparkles,
  Building,
  HelpCircle,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function Footer() {
  const [activeModal, setActiveModal] = React.useState<"terms" | "privacy" | null>(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <footer className="w-full border-t border-border/80 bg-card/60 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle decorative top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pb-20">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-border/60">
            
            {/* Brand Column (Spans 4 columns) */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-xl tracking-tight text-foreground">SuperSync</span>
                  <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Academic Project Suite
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                A unified academic governance platform bridging final-year students, supervisors, and department chairs. Streamline topic approvals, chapter reviews, and defense preparation with confidence.
              </p>

              {/* Status & Trust Badges */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>System Operational</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium">
                  <Lock className="h-3 w-3 text-primary" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>
            </div>

            {/* Links Column 1: Portals */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Portals & Access
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground/70 group-hover:text-primary" />
                    <span>Student Portal</span>
                  </Link>
                </li>
                <li>
                  <Link href="/supervisor-login" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    <Building className="h-3.5 w-3.5 text-muted-foreground/70 group-hover:text-primary" />
                    <span>Supervisor Desk</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin-login" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/70 group-hover:text-primary" />
                    <span>Administration</span>
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Student Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/supervisor-register" className="text-muted-foreground hover:text-primary transition-colors">
                    Faculty Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Core Features */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Workflows
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Topic Approval
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Chapter Submissions
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Supervisor Reviews
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Meeting Scheduler
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Milestone Tracking
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Academic Resources */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Academic Resources
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Project Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Formatting Templates
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Defense Rubric
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Academic Integrity
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Department Deadlines
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 4: Institution & Support */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Support & Help
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Helpdesk Support
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    System Guides
                  </Link>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal("privacy")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <span className="text-xs text-muted-foreground/70 block pt-1">
                    Session: 2025/2026
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright, Policies, and Scroll-to-Top */}
          {/* Note: Generous padding-bottom + right margin clearance ensures floating widgets (e.g. Next dev badge on left, Demo switcher on right) never overlap content */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>© 2026 SuperSync. All rights reserved.</p>
              <span className="hidden sm:inline text-muted-foreground/40">•</span>
              <p className="text-muted-foreground/80">
                Institutional Student Project Management System
              </p>
            </div>

            {/* Right Side Actions with buffer for the floating demo role switcher */}
            <div className="flex items-center gap-6 sm:pr-32 md:pr-40">
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-foreground transition-colors hover:underline"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-foreground transition-colors hover:underline"
              >
                Privacy Policy
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 rounded-lg"
                title="Scroll to top"
              >
                <span>Back to top</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Modal for Terms of Service */}
      <Dialog open={activeModal === "terms"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Terms of Service
            </DialogTitle>
            <DialogDescription>
              Academic policies and terms governing the SuperSync system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
            <h5 className="font-semibold text-foreground">1. Academic Integrity & Ownership</h5>
            <p>
              All submitted topics, project chapters, source code, and deliverables remain the academic intellectual property of the student and institution in accordance with university research guidelines.
            </p>
            <h5 className="font-semibold text-foreground">2. Supervisor Review & Milestones</h5>
            <p>
              Milestone approvals and meeting evaluations logged in SuperSync constitute binding academic records for semester grading and defense clearance.
            </p>
            <h5 className="font-semibold text-foreground">3. System Usage</h5>
            <p>
              Accounts are provisioned for registered university students, faculty supervisors, and departmental administrators. Unauthorized distribution of credentials is strictly prohibited.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Modal for Privacy Policy */}
      <Dialog open={activeModal === "privacy"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Privacy & Data Governance
            </DialogTitle>
            <DialogDescription>
              How student research submissions and academic records are protected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
            <h5 className="font-semibold text-foreground">1. Data Encryption & Storage</h5>
            <p>
              Student project documents, chapter uploads, and supervisor evaluations are securely stored and encrypted in transit using 256-bit SSL protocols.
            </p>
            <h5 className="font-semibold text-foreground">2. Access Control</h5>
            <p>
              Submissions are strictly restricted to assigned project supervisors, department project coordinators, and authorized external examiners.
            </p>
            <h5 className="font-semibold text-foreground">3. Retention Schedule</h5>
            <p>
              Final defense manuscripts and repository archives are preserved for institutional graduation verification and accreditation compliance.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
