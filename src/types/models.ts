export type Role = "STUDENT" | "SUPERVISOR" | "ADMIN";

export type TopicStatus = "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

export type ChapterStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

export type MeetingStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type NotificationType = "SYSTEM" | "TOPIC" | "CHAPTER" | "MEETING" | "MESSAGE";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  studentProfile?: StudentProfile | null;
  supervisorProfile?: SupervisorProfile | null;
  adminProfile?: AdminProfile | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  students: StudentProfile[];
  supervisors: SupervisorProfile[];
  _count: {
    students: number;
    supervisors: number;
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  user: User;
  matricNumber: string;
  departmentId: string;
  department: Department;
  level: number | null;
  supervisorId: string | null;
  supervisor?: SupervisorProfile | null;
  topics: Topic[];
  chapters: Chapter[];
  meetings: Meeting[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupervisorProfile {
  id: string;
  userId: string;
  user: User;
  staffId: string;
  departmentId: string;
  department: Department;
  maxStudents: number;
  assignedStudents: StudentProfile[];
  meetings: Meeting[];
  _count: {
    assignedStudents: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  studentId: string;
  student: StudentProfile;
  title: string;
  description: string | null;
  background: string | null;
  problemStatement: string | null;
  objectives: string | null;
  methodology: string | null;
  status: TopicStatus;
  supervisorReview: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  studentId: string;
  student: StudentProfile;
  title: string;
  number: number;
  version: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: ChapterStatus;
  submittedAt: Date;
  updatedAt: Date;
  comments: Comment[];
}

export interface Comment {
  id: string;
  chapterId: string;
  chapter: Chapter;
  authorId: string;
  content: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  studentId: string;
  student: StudentProfile;
  supervisorId: string;
  supervisor: SupervisorProfile;
  date: Date;
  agenda: string;
  notes: string | null;
  status: MeetingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  sender: Partial<User>;
  receiverId: string;
  receiver: Partial<User>;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}
