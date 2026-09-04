"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"

export async function getSupervisorStudents() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") {
    return []
  }

  const supervisorProfile = await prisma.supervisorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!supervisorProfile) return []

  const students = await prisma.studentProfile.findMany({
    where: { supervisorId: supervisorProfile.id },
    include: {
      user: true,
      department: true,
      topics: {
        orderBy: { updatedAt: "desc" },
        take: 1
      },
      chapters: {
        orderBy: { number: "desc" },
        take: 1
      }
    }
  })

  return students
}
