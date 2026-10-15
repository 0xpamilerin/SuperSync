"use server"

import prisma from "@/lib/db"

export async function registerUser(formData: FormData) {
  try {
    const role = formData.get("role") as "STUDENT" | "SUPERVISOR"
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = (formData.get("password") as string) || "password123"
    const departmentId = formData.get("departmentId") as string

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User with this email already exists." }
    }

    if (role === "STUDENT") {
      const matricNumber = formData.get("matricNumber") as string
      const level = parseInt(formData.get("level") as string) || 400

      const existingStudent = await prisma.studentProfile.findUnique({
        where: { matricNumber },
      })
      if (existingStudent) return { error: "Matric number is already registered." }

      await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
          studentProfile: {
            create: {
              matricNumber,
              departmentId,
              level,
            }
          }
        }
      })
    } else if (role === "SUPERVISOR") {
      const staffId = formData.get("staffId") as string

      const existingStaff = await prisma.supervisorProfile.findUnique({
        where: { staffId },
      })
      if (existingStaff) return { error: "Staff ID is already registered." }

      await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
          supervisorProfile: {
            create: {
              staffId,
              departmentId,
              maxStudents: 5 // Default
            }
          }
        }
      })
    } else if (role === "ADMIN") {
      await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
        }
      })
    } else {
      return { error: "Invalid role selected." }
    }

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Failed to register. Please check your inputs and try again." }
  }
}
