"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { resolveUser } from "@/lib/user-helper"

export async function getUserProfile() {
  const session = await auth()
  if (!session?.user) return null

  const resolvedUser = await resolveUser(session)
  if (!resolvedUser) return null

  return prisma.user.findUnique({
    where: { id: resolvedUser.id },
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
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const resolvedUser = await resolveUser(session)
  if (!resolvedUser) return { success: false, error: "User not found" }

  try {
    await prisma.user.update({
      where: { id: resolvedUser.id },
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
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const resolvedUser = await resolveUser(session)
  if (!resolvedUser) return { success: false, error: "User not found" }

  try {
    const user = await prisma.user.findUnique({ where: { id: resolvedUser.id } })
    if (!user) return { success: false, error: "User not found" }

    const isValid = await bcrypt.compare(data.currentPassword, user.password)
    if (!isValid) return { success: false, error: "Incorrect current password" }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await prisma.user.update({
      where: { id: resolvedUser.id },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
