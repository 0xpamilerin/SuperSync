"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

const DEFAULT_PASSWORD = "password123"

export async function getStudents() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "ADMIN") return []
  
  return prisma.studentProfile.findMany({
    include: {
      user: true,
      department: true,
      supervisor: {
        include: { user: true }
      }
    },
    orderBy: { user: { createdAt: 'desc' } }
  })
}

export async function getSupervisors() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "ADMIN") return []
  
  return prisma.supervisorProfile.findMany({
    include: {
      user: true,
      department: true,
      assignedStudents: true
    },
    orderBy: { user: { createdAt: 'desc' } }
  })
}

export async function getSessions() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "ADMIN") return []

  return prisma.session.findMany({
    orderBy: { startDate: 'desc' }
  })
}


export async function uploadStudentsCSV(csvData: string) {
  try {
    const lines = csvData.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    let processed = 0
    const errors: string[] = []

    // Assuming first line is header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const [name, email, matric, department] = line.split(",").map(s => s.trim())
      
      if (!name || !email || !matric || !department) {
        errors.push(`Line ${i + 1}: Missing required fields`)
        continue
      }

      try {
        let dept = await prisma.department.findUnique({ where: { name: department } })
        if (!dept) {
           dept = await prisma.department.create({ data: { name: department, code: department.substring(0, 3).toUpperCase() } })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
          errors.push(`Line ${i + 1}: User with email ${email} already exists`)
          continue
        }

        await prisma.user.create({
          data: {
            name,
            email,
            password: DEFAULT_PASSWORD,
            role: "STUDENT",
            studentProfile: {
              create: {
                matricNumber: matric,
                departmentId: dept.id
              }
            }
          }
        })
        processed++
      } catch (err: any) {
        errors.push(`Line ${i + 1}: ${err.message}`)
      }
    }
    
    revalidatePath("/admin/students")
    return { success: true, processed, errors }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadSupervisorsCSV(csvData: string) {
  try {
    const lines = csvData.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    let processed = 0
    const errors: string[] = []

    // Assuming first line is header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const [name, email, staffId, department, maxLoadStr] = line.split(",").map(s => s.trim())
      
      if (!name || !email || !staffId || !department) {
        errors.push(`Line ${i + 1}: Missing required fields`)
        continue
      }

      try {
        let dept = await prisma.department.findUnique({ where: { name: department } })
        if (!dept) {
           dept = await prisma.department.create({ data: { name: department, code: department.substring(0, 3).toUpperCase() } })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
          errors.push(`Line ${i + 1}: User with email ${email} already exists`)
          continue
        }

        const maxLoad = maxLoadStr ? parseInt(maxLoadStr, 10) : 5

        await prisma.user.create({
          data: {
            name,
            email,
            password: DEFAULT_PASSWORD,
            role: "SUPERVISOR",
            supervisorProfile: {
              create: {
                staffId: staffId,
                departmentId: dept.id,
                maxStudents: isNaN(maxLoad) ? 5 : maxLoad
              }
            }
          }
        })
        processed++
      } catch (err: any) {
        errors.push(`Line ${i + 1}: ${err.message}`)
      }
    }
    
    revalidatePath("/admin/supervisors")
    return { success: true, processed, errors }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAssignmentData() {
  const assignments = await prisma.studentProfile.findMany({
    where: { supervisorId: { not: null } },
    include: {
      user: true,
      department: true,
      supervisor: {
        include: { user: true }
      }
    }
  })

  const unassignedStudents = await prisma.studentProfile.findMany({
    where: { supervisorId: null },
    include: {
      user: true,
      department: true
    }
  })

  const supervisors = await prisma.supervisorProfile.findMany({
    include: {
      user: true,
      department: true,
      _count: {
        select: { assignedStudents: true }
      }
    }
  })

  return { assignments, unassignedStudents, supervisors }
}

import { createNotification } from "@/app/actions/notifications"

export async function autoAssignStudents(departmentAware: boolean) {
  try {
    const unassignedStudents = await prisma.studentProfile.findMany({
      where: { supervisorId: null },
      include: { department: true, user: true }
    })

    const supervisors = await prisma.supervisorProfile.findMany({
      include: {
        department: true,
        user: true,
        _count: {
          select: { assignedStudents: true }
        }
      }
    })

    let assignedCount = 0

    const shuffledStudents = [...unassignedStudents].sort(() => Math.random() - 0.5)

    for (const student of shuffledStudents) {
      let suitableSupervisors = supervisors.filter(s => s._count.assignedStudents < s.maxStudents)
      
      if (departmentAware) {
        const deptSups = suitableSupervisors.filter(s => s.departmentId === student.departmentId)
        if (deptSups.length > 0) {
          suitableSupervisors = deptSups
        }
      }

      if (suitableSupervisors.length > 0) {
        const supervisor = suitableSupervisors[Math.floor(Math.random() * suitableSupervisors.length)]
        
        await prisma.studentProfile.update({
          where: { id: student.id },
          data: { supervisorId: supervisor.id }
        })

        supervisor._count.assignedStudents++
        assignedCount++

        if (student.userId) {
          await createNotification({
            userId: student.userId,
            title: "Supervisor Assigned",
            message: `You have been assigned to supervisor ${supervisor.user.name}.`,
            type: "SYSTEM",
            link: "/student"
          })
        }
        if (supervisor.userId) {
          await createNotification({
            userId: supervisor.userId,
            title: "New Student Assigned",
            message: `Student ${student.user.name} has been assigned to your supervision.`,
            type: "SYSTEM",
            link: "/supervisor"
          })
        }
      }
    }

    revalidatePath("/admin/assignments")
    return { success: true, assignedCount }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function manualAssignStudent(studentProfileId: string, supervisorProfileId: string) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: true }
    })
    const supervisor = await prisma.supervisorProfile.findUnique({
      where: { id: supervisorProfileId },
      include: { user: true }
    })

    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { supervisorId: supervisorProfileId }
    })

    if (student && supervisor) {
      await createNotification({
        userId: student.userId,
        title: "Supervisor Assigned",
        message: `You have been assigned to supervisor ${supervisor.user.name}.`,
        type: "SYSTEM",
        link: "/student"
      })
      await createNotification({
        userId: supervisor.userId,
        title: "New Student Assigned",
        message: `Student ${student.user.name} has been assigned to your supervision.`,
        type: "SYSTEM",
        link: "/supervisor"
      })
    }

    revalidatePath("/admin/assignments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function unassignStudent(studentProfileId: string) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: true, supervisor: { include: { user: true } } }
    })

    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { supervisorId: null }
    })

    if (student) {
      await createNotification({
        userId: student.userId,
        title: "Supervisor Unassigned",
        message: "Your supervisor allocation has been reset by the department administrator.",
        type: "SYSTEM",
        link: "/student"
      })
      if (student.supervisor) {
        await createNotification({
          userId: student.supervisor.userId,
          title: "Student Unassigned",
          message: `Student ${student.user.name} is no longer assigned to you.`,
          type: "SYSTEM",
          link: "/supervisor"
        })
      }
    }

    revalidatePath("/admin/assignments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createSession(data: { title: string; startDate: Date; endDate: Date; isActive?: boolean }) {
  try {
    const sessionAuth = await auth()
    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    if (data.isActive) {
      await prisma.session.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const newSession = await prisma.session.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? false
      }
    })

    revalidatePath("/admin/sessions")
    return { success: true, session: newSession }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function setActiveSession(sessionId: string) {
  try {
    const sessionAuth = await auth()
    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    await prisma.session.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: true }
    })

    revalidatePath("/admin/sessions")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function archiveSession(sessionId: string) {
  try {
    const sessionAuth = await auth()
    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    })

    revalidatePath("/admin/sessions")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getDepartments() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return []
  return prisma.department.findMany({
    include: {
      _count: {
        select: {
          students: true,
          supervisors: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createDepartment(name: string, code: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const dept = await prisma.department.create({
      data: { name: name.trim(), code: code.trim().toUpperCase() }
    })
    revalidatePath("/admin/departments")
    return { success: true, department: dept }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteDepartment(id: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    // Check if department has associated students or supervisors
    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, supervisors: true }
        }
      }
    })

    if (!dept) return { success: false, error: "Department not found" }
    if (dept._count.students > 0 || dept._count.supervisors > 0) {
      return { 
        success: false, 
        error: `Cannot delete department with active students (${dept._count.students}) or supervisors (${dept._count.supervisors})` 
      }
    }

    await prisma.department.delete({
      where: { id }
    })
    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getReportsData() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null

  const [
    totalStudents,
    totalSupervisors,
    totalTopics,
    topicsApproved,
    topicsPending,
    totalChapters,
    chaptersApproved,
    chaptersPending,
    departments,
    supervisorsWithCount
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.supervisorProfile.count(),
    prisma.topic.count(),
    prisma.topic.count({ where: { status: "APPROVED" } }),
    prisma.topic.count({ where: { status: "PENDING" } }),
    prisma.chapter.count(),
    prisma.chapter.count({ where: { status: "APPROVED" } }),
    prisma.chapter.count({ where: { status: "PENDING" } }),
    prisma.department.findMany({
      include: {
        _count: {
          select: {
            students: true,
            supervisors: true
          }
        }
      }
    }),
    prisma.supervisorProfile.findMany({
      include: {
        user: true,
        department: true,
        _count: {
          select: { assignedStudents: true }
        }
      }
    })
  ])

  return {
    overview: {
      totalStudents,
      totalSupervisors,
      totalTopics,
      topicsApproved,
      topicsPending,
      totalChapters,
      chaptersApproved,
      chaptersPending
    },
    departments,
    supervisors: supervisorsWithCount
  }
}

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) {
    map[s.key] = s.value
  }
  return map
}

export async function updateSystemSettings(settings: Record<string, string>) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    }
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

