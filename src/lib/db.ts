import {
  INITIAL_DEPARTMENTS,
  INITIAL_SESSIONS,
  INITIAL_USERS,
  INITIAL_ADMIN_PROFILES,
  INITIAL_SUPERVISOR_PROFILES,
  INITIAL_STUDENT_PROFILES,
  INITIAL_TOPICS,
  INITIAL_CHAPTERS,
  INITIAL_COMMENTS,
  INITIAL_MEETINGS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SYSTEM_SETTINGS,
} from "./mock-data"
import {
  User,
  StudentProfile,
  SupervisorProfile,
  AdminProfile,
  Department,
  Session,
  Topic,
  Chapter,
  Comment,
  Meeting,
  Message,
  Notification,
  Announcement,
  SystemSetting,
} from "@/types/models"

interface MockDbState {
  users: User[]
  studentProfiles: StudentProfile[]
  supervisorProfiles: SupervisorProfile[]
  adminProfiles: AdminProfile[]
  departments: Department[]
  sessions: Session[]
  topics: Topic[]
  chapters: Chapter[]
  comments: Comment[]
  meetings: Meeting[]
  messages: Message[]
  notifications: Notification[]
  announcements: Announcement[]
  systemSettings: SystemSetting[]
}

const getInitialState = (): MockDbState => ({
  users: [...INITIAL_USERS],
  studentProfiles: [...INITIAL_STUDENT_PROFILES],
  supervisorProfiles: [...INITIAL_SUPERVISOR_PROFILES],
  adminProfiles: [...INITIAL_ADMIN_PROFILES],
  departments: [...INITIAL_DEPARTMENTS],
  sessions: [...INITIAL_SESSIONS],
  topics: [...INITIAL_TOPICS],
  chapters: [...INITIAL_CHAPTERS],
  comments: [...INITIAL_COMMENTS],
  meetings: [...INITIAL_MEETINGS],
  messages: [...INITIAL_MESSAGES],
  notifications: [...INITIAL_NOTIFICATIONS],
  announcements: [...INITIAL_ANNOUNCEMENTS],
  systemSettings: [...INITIAL_SYSTEM_SETTINGS],
})

declare global {
  // eslint-disable-next-line no-var
  var __mockDbGlobal: MockDbState | undefined
}

const state: MockDbState = globalThis.__mockDbGlobal ?? getInitialState()
if (process.env.NODE_ENV !== "production") {
  globalThis.__mockDbGlobal = state
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`

// Helper to filter items using standard where conditions
function matchesWhere(item: any, where?: any): boolean {
  if (!where || Object.keys(where).length === 0) return true

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(val)) {
      const orMatched = val.some((subCondition) => matchesWhere(item, subCondition))
      if (!orMatched) return false
      continue
    }

    if (key === "AND" && Array.isArray(val)) {
      const andMatched = val.every((subCondition) => matchesWhere(item, subCondition))
      if (!andMatched) return false
      continue
    }

    const itemVal = item[key]

    if (val === null) {
      if (itemVal !== null && itemVal !== undefined) return false
      continue
    }

    if (typeof val === "object" && val !== null) {
      if (val instanceof Date) {
        if (!itemVal || new Date(itemVal).getTime() !== val.getTime()) return false
      } else if ("not" in val) {
        if (val.not === null) {
          if (itemVal === null || itemVal === undefined) return false
        } else if (itemVal === val.not) {
          return false
        }
      } else if ("gte" in val) {
        const target = new Date(val.gte as any).getTime()
        const actual = itemVal ? new Date(itemVal).getTime() : 0
        if (actual < target) return false
      } else if ("lte" in val) {
        const target = new Date(val.lte as any).getTime()
        const actual = itemVal ? new Date(itemVal).getTime() : 0
        if (actual > target) return false
      } else if ("in" in val && Array.isArray(val.in)) {
        if (!val.in.includes(itemVal)) return false
      } else if ("contains" in val && typeof val.contains === "string") {
        const isInsensitive = (val as any).mode === "insensitive"
        const needle = isInsensitive ? val.contains.toLowerCase() : val.contains
        const haystack = typeof itemVal === "string"
          ? (isInsensitive ? itemVal.toLowerCase() : itemVal)
          : ""
        if (!haystack.includes(needle)) return false
      } else {
        // Nested relation match, e.g. student: { supervisorId: ... } or user: { email: ... }
        if (!itemVal || !matchesWhere(itemVal, val)) return false
      }
      continue
    }

    // Case-insensitive comparison for email if strings
    if (typeof val === "string" && typeof itemVal === "string") {
      if (key === "email") {
        if (itemVal.toLowerCase() !== val.toLowerCase()) return false
        continue
      }
    }

    if (itemVal !== val) return false
  }

  return true
}

// Attach relations based on Prisma `include` block
function attachRelations(item: any, type: string, include?: any): any {
  if (!item) return null
  const clone = { ...item }

  // Default empty collections so callers never get undefined
  if (type === "studentProfile") {
    clone.topics = state.topics.filter((t) => t.studentId === clone.id)
    clone.chapters = state.chapters.filter((c) => c.studentId === clone.id)
    clone.meetings = state.meetings.filter((m) => m.studentId === clone.id)
    clone.department = state.departments.find((d) => d.id === clone.departmentId) || clone.department
    clone.user = state.users.find((u) => u.id === clone.userId) || clone.user

    const sup = state.supervisorProfiles.find((s) => s.id === clone.supervisorId)
    if (sup) {
      clone.supervisor = attachRelations(sup, "supervisorProfile", { user: true })
    } else {
      clone.supervisor = null
    }
  }

  if (type === "supervisorProfile") {
    clone.user = state.users.find((u) => u.id === clone.userId) || clone.user
    clone.department = state.departments.find((d) => d.id === clone.departmentId) || clone.department
    clone.assignedStudents = state.studentProfiles.filter((s) => s.supervisorId === clone.id)
    clone.meetings = state.meetings.filter((m) => m.supervisorId === clone.id)
    clone._count = {
      assignedStudents: clone.assignedStudents.length,
    }
  }

  if (type === "user") {
    const sp = state.studentProfiles.find((s) => s.userId === clone.id)
    clone.studentProfile = sp ? attachRelations(sp, "studentProfile", { department: true }) : null

    const sup = state.supervisorProfiles.find((s) => s.userId === clone.id)
    clone.supervisorProfile = sup ? attachRelations(sup, "supervisorProfile", { department: true }) : null

    clone.adminProfile = state.adminProfiles.find((a) => a.userId === clone.id) || null
  }

  if (type === "topic") {
    const st = state.studentProfiles.find((s) => s.id === clone.studentId)
    clone.student = st ? attachRelations(st, "studentProfile", { user: true }) : clone.student
  }

  if (type === "chapter") {
    const st = state.studentProfiles.find((s) => s.id === clone.studentId)
    clone.student = st ? attachRelations(st, "studentProfile", { user: true }) : clone.student
    clone.comments = state.comments
      .filter((c) => c.chapterId === clone.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  if (type === "comment") {
    const ch = state.chapters.find((c) => c.id === clone.chapterId)
    clone.chapter = ch ? attachRelations(ch, "chapter", { student: { include: { user: true } } }) : clone.chapter
  }

  if (type === "meeting") {
    const st = state.studentProfiles.find((s) => s.id === clone.studentId)
    clone.student = st ? attachRelations(st, "studentProfile", { user: true }) : clone.student

    const sup = state.supervisorProfiles.find((s) => s.id === clone.supervisorId)
    clone.supervisor = sup ? attachRelations(sup, "supervisorProfile", { user: true }) : clone.supervisor
  }

  if (type === "department") {
    clone.students = state.studentProfiles.filter((s) => s.departmentId === clone.id)
    clone.supervisors = state.supervisorProfiles.filter((s) => s.departmentId === clone.id)
    clone._count = {
      students: clone.students.length,
      supervisors: clone.supervisors.length,
    }
  }

  if (type === "message") {
    clone.sender = state.users.find((u) => u.id === clone.senderId) || clone.sender
    clone.receiver = state.users.find((u) => u.id === clone.receiverId) || clone.receiver
  }

  return clone
}

// In-Memory Model Handler Factory
function createCollection<T extends { id: string }>(
  collectionKey: keyof MockDbState,
  typeName: string,
  idPrefix: string
) {
  const getItems = (): T[] => (state[collectionKey] as unknown) as T[]

  return {
    async findUnique(args: { where: any; include?: any; select?: any }): Promise<T | null> {
      const items = getItems()
      const found = items.find((item) => matchesWhere(attachRelations(item, typeName), args.where))
      return found ? attachRelations(found, typeName, args.include) : null
    },

    async findFirst(args?: { where?: any; include?: any; select?: any; orderBy?: any }): Promise<T | null> {
      let items = getItems()
      if (args?.where) {
        items = items.filter((item) => matchesWhere(attachRelations(item, typeName), args.where))
      }
      if (args?.orderBy) {
        items = sortItems(items, args.orderBy)
      }
      const first = items[0]
      return first ? attachRelations(first, typeName, args?.include) : null
    },

    async findMany(args?: {
      where?: any
      include?: any
      select?: any
      orderBy?: any
      take?: number
    }): Promise<T[]> {
      let items = getItems()
      if (args?.where) {
        items = items.filter((item) => matchesWhere(attachRelations(item, typeName), args.where))
      }
      if (args?.orderBy) {
        items = sortItems(items, args.orderBy)
      }
      if (typeof args?.take === "number") {
        items = items.slice(0, args.take)
      }
      return items.map((item) => attachRelations(item, typeName, args?.include))
    },

    async count(args?: { where?: any }): Promise<number> {
      let items = getItems()
      if (args?.where) {
        items = items.filter((item) => matchesWhere(attachRelations(item, typeName), args.where))
      }
      return items.length
    },

    async create(args: { data: any; include?: any }): Promise<T> {
      const now = new Date()
      const newItem: any = {
        id: args.data.id || generateId(idPrefix),
        createdAt: now,
        updatedAt: now,
        ...args.data,
      }

      // Handle nested studentProfile creation when creating user
      if (typeName === "user" && args.data.studentProfile?.create) {
        delete newItem.studentProfile
        const studentProfileData = args.data.studentProfile.create
        const createdProfile: any = {
          id: generateId("stu-prof"),
          userId: newItem.id,
          user: newItem,
          matricNumber: studentProfileData.matricNumber,
          departmentId: studentProfileData.departmentId,
          level: studentProfileData.level || 400,
          supervisorId: null,
          topics: [],
          chapters: [],
          meetings: [],
          createdAt: now,
          updatedAt: now,
        }
        state.studentProfiles.push(createdProfile)
      }

      // Handle nested supervisorProfile creation when creating user
      if (typeName === "user" && args.data.supervisorProfile?.create) {
        delete newItem.supervisorProfile
        const supProfileData = args.data.supervisorProfile.create
        const createdProfile: any = {
          id: generateId("sup-prof"),
          userId: newItem.id,
          user: newItem,
          staffId: supProfileData.staffId,
          departmentId: supProfileData.departmentId,
          maxStudents: supProfileData.maxStudents || 5,
          assignedStudents: [],
          meetings: [],
          _count: { assignedStudents: 0 },
          createdAt: now,
          updatedAt: now,
        }
        state.supervisorProfiles.push(createdProfile)
      }

      // Handle nested adminProfile creation
      if (typeName === "user" && args.data.adminProfile?.create) {
        delete newItem.adminProfile
        const createdAdmin: any = {
          id: generateId("adm-prof"),
          userId: newItem.id,
          user: newItem,
          createdAt: now,
          updatedAt: now,
        }
        state.adminProfiles.push(createdAdmin)
      }

      ;(state[collectionKey] as any[]).push(newItem)
      return attachRelations(newItem, typeName, args.include)
    },

    async createMany(args: { data: any[] }): Promise<{ count: number }> {
      const now = new Date()
      for (const entry of args.data) {
        const item: any = {
          id: entry.id || generateId(idPrefix),
          createdAt: now,
          updatedAt: now,
          ...entry,
        }
        ;(state[collectionKey] as any[]).push(item)
      }
      return { count: args.data.length }
    },

    async update(args: { where: any; data: any; include?: any }): Promise<T> {
      const items = getItems() as any[]
      const idx = items.findIndex((item) => matchesWhere(attachRelations(item, typeName), args.where))
      if (idx === -1) {
        throw new Error(`Record to update not found in ${typeName}`)
      }
      items[idx] = {
        ...items[idx],
        ...args.data,
        updatedAt: new Date(),
      }
      return attachRelations(items[idx], typeName, args.include)
    },

    async updateMany(args: { where: any; data: any }): Promise<{ count: number }> {
      const items = getItems() as any[]
      let count = 0
      for (let i = 0; i < items.length; i++) {
        if (matchesWhere(attachRelations(items[i], typeName), args.where)) {
          items[i] = {
            ...items[i],
            ...args.data,
            updatedAt: new Date(),
          }
          count++
        }
      }
      return { count }
    },

    async upsert(args: { where: any; update: any; create: any; include?: any }): Promise<T> {
      const items = getItems() as any[]
      const idx = items.findIndex((item) => matchesWhere(attachRelations(item, typeName), args.where))
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          ...args.update,
          updatedAt: new Date(),
        }
        return attachRelations(items[idx], typeName, args.include)
      } else {
        const now = new Date()
        const newItem: any = {
          id: args.create.id || generateId(idPrefix),
          createdAt: now,
          updatedAt: now,
          ...args.create,
        }
        items.push(newItem)
        return attachRelations(newItem, typeName, args.include)
      }
    },

    async delete(args: { where: any }): Promise<T> {
      const items = getItems() as any[]
      const idx = items.findIndex((item) => matchesWhere(attachRelations(item, typeName), args.where))
      if (idx === -1) {
        throw new Error(`Record to delete not found in ${typeName}`)
      }
      const deleted = items.splice(idx, 1)[0]
      return deleted
    },
  }
}

function sortItems<T>(items: T[], orderBy: any): T[] {
  const cloned = [...items]
  cloned.sort((a: any, b: any) => {
    for (const [key, dir] of Object.entries(orderBy)) {
      let valA = a[key]
      let valB = b[key]

      if (typeof dir === "object" && dir !== null) {
        const subKey = Object.keys(dir)[0]
        const subDir = (dir as any)[subKey]
        valA = valA ? valA[subKey] : undefined
        valB = valB ? valB[subKey] : undefined
        return compareValues(valA, valB, subDir)
      }

      const cmp = compareValues(valA, valB, dir)
      if (cmp !== 0) return cmp
    }
    return 0
  })
  return cloned
}

function compareValues(valA: any, valB: any, dir: any): number {
  if (valA instanceof Date) valA = valA.getTime()
  if (valB instanceof Date) valB = valB.getTime()
  if (valA < valB) return dir === "desc" ? 1 : -1
  if (valA > valB) return dir === "desc" ? -1 : 1
  return 0
}

export const mockDb = {
  user: createCollection<User>("users", "user", "usr"),
  studentProfile: createCollection<StudentProfile>("studentProfiles", "studentProfile", "stu-prof"),
  supervisorProfile: createCollection<SupervisorProfile>("supervisorProfiles", "supervisorProfile", "sup-prof"),
  adminProfile: createCollection<AdminProfile>("adminProfiles", "adminProfile", "adm-prof"),
  department: createCollection<Department>("departments", "department", "dept"),
  session: createCollection<Session>("sessions", "session", "ses"),
  topic: createCollection<Topic>("topics", "topic", "top"),
  chapter: createCollection<Chapter>("chapters", "chapter", "chap"),
  comment: createCollection<Comment>("comments", "comment", "comm"),
  meeting: createCollection<Meeting>("meetings", "meeting", "meet"),
  message: createCollection<Message>("messages", "message", "msg"),
  notification: createCollection<Notification>("notifications", "notification", "notif"),
  announcement: createCollection<Announcement>("announcements", "announcement", "ann"),
  systemSetting: createCollection<SystemSetting>("systemSettings", "systemSetting", "set"),

  _state: state,
  _reset: () => {
    const fresh = getInitialState()
    Object.assign(state, fresh)
  },
}

export default mockDb
