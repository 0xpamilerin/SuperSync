"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
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
    let errors: string[] = []

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

        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

        await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
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
    let errors: string[] = []

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

        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

        await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
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

export async function autoAssignStudents(departmentAware: boolean) {
  try {
    const unassignedStudents = await prisma.studentProfile.findMany({
      where: { supervisorId: null },
      include: { department: true }
    })

    const supervisors = await prisma.supervisorProfile.findMany({
      include: {
        department: true,
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
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { supervisorId: supervisorProfileId }
    })
    revalidatePath("/admin/assignments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function unassignStudent(studentProfileId: string) {
  try {
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { supervisorId: null }
    })
    revalidatePath("/admin/assignments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
