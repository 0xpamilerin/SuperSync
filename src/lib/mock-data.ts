export type UserRole = "student" | "supervisor" | "admin";

export const currentUser = {
  name: "John Doe",
  email: "john.doe@ui.edu.ng",
  role: "student" as UserRole,
  avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  department: "Computer Science",
};

export const getNavItems = (role: UserRole) => {
  const items = {
    student: [
      { title: "Dashboard", href: "/student", icon: "LayoutDashboard" },
      { title: "Project Topics", href: "/student/topics", icon: "Lightbulb" },
      { title: "Project Proposal", href: "/student/proposal", icon: "FileText" },
      { title: "Chapters", href: "/student/chapters", icon: "BookOpen" },
      { title: "Supervisor Feedback", href: "/student/feedback", icon: "MessageSquare" },
      { title: "Progress Tracker", href: "/student/progress", icon: "TrendingUp" },
      { title: "Meetings", href: "/student/meetings", icon: "Calendar" },
      { title: "Documents", href: "/student/documents", icon: "Folder" },
      { title: "Notifications", href: "/notifications", icon: "Bell" },
    ],
    supervisor: [
      { title: "Dashboard", href: "/supervisor", icon: "LayoutDashboard" },
      { title: "Students", href: "/supervisor/students", icon: "Users" },
      { title: "Topic Reviews", href: "/supervisor/topics", icon: "FileCheck" },
      { title: "Proposal Reviews", href: "/supervisor/proposals", icon: "FileText" },
      { title: "Chapter Reviews", href: "/supervisor/chapters", icon: "BookCheck" },
      { title: "Feedback", href: "/supervisor/feedback", icon: "MessageSquare" },
      { title: "Meetings", href: "/supervisor/meetings", icon: "Calendar" },
      { title: "Reports", href: "/supervisor/reports", icon: "BarChart" },
      { title: "Notifications", href: "/notifications", icon: "Bell" },
    ],
    admin: [
      { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
      { title: "Students", href: "/admin/students", icon: "Users" },
      { title: "Supervisors", href: "/admin/supervisors", icon: "UserCheck" },
      { title: "Assignments", href: "/admin/assignments", icon: "UserPlus" },
      { title: "Academic Sessions", href: "/admin/sessions", icon: "CalendarDays" },
      { title: "Departments", href: "/admin/departments", icon: "Building" },
      { title: "Reports", href: "/admin/reports", icon: "BarChart" },
      { title: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
      { title: "System Settings", href: "/admin/settings", icon: "Settings" },
    ],
  };
  return items[role];
};
