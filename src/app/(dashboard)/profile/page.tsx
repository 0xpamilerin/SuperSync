import * as React from "react"
import { getUserProfile } from "@/app/actions/profile"
import { ProfileClient } from "./ProfileClient"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const userProfile = await getUserProfile()

  if (!userProfile) {
    redirect("/login")
  }

  return <ProfileClient userProfile={userProfile} />
}
