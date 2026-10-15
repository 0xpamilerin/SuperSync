"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getAnnouncements() {
  const session = await auth()
  if (!session || !session.user?.id) return []

  // Admins see all announcements
  if (session.user.role === "ADMIN") {
    return prisma.announcement.findMany({
      orderBy: { createdAt: "desc" }
    })
  }

  // Students and Supervisors only see published announcements targeted to them (or All)
  const target = session.user.role === "STUDENT" ? "Students" : "Supervisors"
  return prisma.announcement.findMany({
    where: {
      status: "Published",
      OR: [
        { target: "All" },
        { target: target }
      ]
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function createAnnouncement(data: {
  title: string
  content: string
  target: string
  status: string
}) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const announcement = await prisma.announcement.create({
    data
  })

  if (data.status === "Published") {
    try {
      let roleFilter = {}
      if (data.target === "Students") {
        roleFilter = { role: "STUDENT" }
      } else if (data.target === "Supervisors") {
        roleFilter = { role: "SUPERVISOR" }
      } else {
        roleFilter = { role: { in: ["STUDENT", "SUPERVISOR"] } }
      }

      const targetUsers = await prisma.user.findMany({
        where: roleFilter,
        select: { id: true }
      })

      if (targetUsers.length > 0) {
        await prisma.notification.createMany({
          data: targetUsers.map(u => ({
            userId: u.id,
            title: `Announcement: ${data.title}`,
            message: data.content.slice(0, 120) + (data.content.length > 120 ? "..." : ""),
            type: "SYSTEM",
            link: "/notifications"
          }))
        })
      }
    } catch (notifErr) {
      console.error("Failed to broadcast announcement notification:", notifErr)
    }
  }

  revalidatePath("/admin/announcements")
  revalidatePath("/student")
  revalidatePath("/supervisor")
  revalidatePath("/")
  return announcement
}

export async function updateAnnouncement(id: string, data: {
  title: string
  content: string
  target: string
  status: string
}) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data
  })

  revalidatePath("/admin/announcements")
  revalidatePath("/student")
  revalidatePath("/supervisor")
  revalidatePath("/")
  return announcement
}

export async function deleteAnnouncement(id: string) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await prisma.announcement.delete({
    where: { id }
  })

  revalidatePath("/admin/announcements")
  revalidatePath("/")
}
