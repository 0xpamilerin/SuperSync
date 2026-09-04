"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"
import { resolveSupervisorProfile } from "@/lib/user-helper"

export async function getSupervisorStudents() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") {
    return []
  }

  const supervisorProfile = await resolveSupervisorProfile(session)

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
