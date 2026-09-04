"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { resolveUser } from "@/lib/user-helper"

export async function sendMessage(receiverId: string, content: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const resolvedUser = await resolveUser(session)
    if (!resolvedUser) {
      return { success: false, error: "User not found" }
    }

    await prisma.message.create({
      data: {
        senderId: resolvedUser.id,
        receiverId,
        content
      }
    })

    revalidatePath("/messages")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getInbox() {
  const session = await auth()
  if (!session?.user) return []

  const resolvedUser = await resolveUser(session)
  if (!resolvedUser) return []

  return prisma.message.findMany({
    where: { receiverId: resolvedUser.id },
    include: {
      sender: { select: { name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getSentMessages() {
  const session = await auth()
  if (!session?.user) return []

  const resolvedUser = await resolveUser(session)
  if (!resolvedUser) return []

  return prisma.message.findMany({
    where: { senderId: resolvedUser.id },
    include: {
      receiver: { select: { name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function markMessageRead(messageId: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    })
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
