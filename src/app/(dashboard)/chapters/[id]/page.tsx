import * as React from "react"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { getChapterById } from "@/app/actions/chapters"
import { ChapterReviewClient } from "./ChapterReviewClient"
import prisma from "@/lib/db"

export default async function ChapterReviewPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !session.user?.id) {
    redirect("/login")
  }

  const chapter = await getChapterById(params.id)
  if (!chapter) {
    notFound()
  }

  // Security check: only allow student who owns it, or their supervisor
  if (session.user.role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })
    if (studentProfile?.id !== chapter.studentId) {
      redirect("/student/dashboard")
    }
  } else if (session.user.role === "SUPERVISOR") {
    const supervisorProfile = await prisma.supervisorProfile.findUnique({
      where: { userId: session.user.id }
    })
    if (supervisorProfile?.id !== chapter.student.supervisorId) {
      redirect("/supervisor/dashboard")
    }
  } else if (session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return <ChapterReviewClient chapter={chapter} currentUser={session.user} />
}
