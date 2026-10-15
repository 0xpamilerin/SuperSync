"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { resolveUser } from "@/lib/user-helper"
import { NotificationType } from "@/types/models"

export async function createNotification(data: {
  userId: string
  title: string
  message: string
  type: NotificationType
  link?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
        isRead: false
      }
    })
    return { success: true, notification }
  } catch (error: any) {
    console.error("Failed to create notification:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserNotifications() {
  const session = await auth()
  if (!session?.user) return []

  const user = await resolveUser(session)
  if (!user) return []

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  })
}

export async function getUnreadNotificationCount() {
  const session = await auth()
  if (!session?.user) return 0

  const user = await resolveUser(session)
  if (!user) return 0

  return prisma.notification.count({
    where: { userId: user.id, isRead: false }
  })
}

export async function markNotificationAsRead(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const user = await resolveUser(session)
    if (!user) return { success: false, error: "User not found" }

    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true }
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const user = await resolveUser(session)
    if (!user) return { success: false, error: "User not found" }

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    })

    revalidatePath("/notifications")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
