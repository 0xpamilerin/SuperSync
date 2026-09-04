"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function sendMessage(receiverId: string, content: string) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.message.create({
      data: {
        senderId: session.user.id,
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
  if (!session || !session.user?.id) return []

  return prisma.message.findMany({
    where: { receiverId: session.user.id },
    include: {
      sender: { select: { name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getSentMessages() {
  const session = await auth()
  if (!session || !session.user?.id) return []

  return prisma.message.findMany({
    where: { senderId: session.user.id },
    include: {
      receiver: { select: { name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function markMessageRead(messageId: string) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) return { success: false }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    })
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
