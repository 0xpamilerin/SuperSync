"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getUserProfile() {
  const session = await auth()
  if (!session || !session.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: {
        include: { department: true }
      },
      supervisorProfile: {
        include: { department: true }
      }
    }
  })
}

export async function updateProfile(data: { name: string }) {
  const session = await auth()
  if (!session || !session.user?.id) return { success: false, error: "Unauthorized" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name }
    })
    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updatePassword(data: { currentPassword: string, newPassword: string }) {
  const session = await auth()
  if (!session || !session.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return { success: false, error: "User not found" }

    const isValid = await bcrypt.compare(data.currentPassword, user.password)
    if (!isValid) return { success: false, error: "Incorrect current password" }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
