import prisma from "@/lib/db"
import { Session } from "next-auth"

export async function resolveUser(session: Session | null) {
  if (!session?.user) return null

  const userId = session.user.id
  const email = session.user.email

  if (!userId && !email) return null

  return prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(email ? [{ email }] : [])
      ]
    }
  })
}

export async function resolveStudentProfile(session: Session | null) {
  if (!session?.user) return null

  const userId = session.user.id
  const email = session.user.email

  if (!userId && !email) return null

  const profile = await prisma.studentProfile.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ user: { email } }] : [])
      ]
    },
    include: {
      user: true,
      department: true,
      supervisor: {
        include: { user: true }
      }
    }
  })

  if (profile) return profile

  // Self-heal: if student user exists in database but has no profile, create default profile
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user && user.role === "STUDENT") {
      let dept = await prisma.department.findFirst()
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: "Computer Science", code: "CSC" }
        })
      }
      return prisma.studentProfile.create({
        data: {
          userId: user.id,
          matricNumber: `MAT${Math.floor(100000 + Math.random() * 900000)}`,
          departmentId: dept.id,
          level: 400
        },
        include: {
          user: true,
          department: true,
          supervisor: {
            include: { user: true }
          }
        }
      })
    }
  }

  return null
}

export async function resolveSupervisorProfile(session: Session | null) {
  if (!session?.user) return null

  const userId = session.user.id
  const email = session.user.email

  if (!userId && !email) return null

  const profile = await prisma.supervisorProfile.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ user: { email } }] : [])
      ]
    },
    include: {
      user: true,
      department: true
    }
  })

  if (profile) return profile

  // Self-heal: if supervisor user exists in database but has no profile, create default profile
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user && user.role === "SUPERVISOR") {
      let dept = await prisma.department.findFirst()
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: "Computer Science", code: "CSC" }
        })
      }
      return prisma.supervisorProfile.create({
        data: {
          userId: user.id,
          staffId: `STAFF${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: dept.id,
          maxStudents: 5
        },
        include: {
          user: true,
          department: true
        }
      })
    }
  }

  return null
}
