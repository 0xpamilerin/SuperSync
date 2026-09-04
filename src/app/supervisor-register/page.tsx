import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import SupervisorRegisterClient from "./SupervisorRegisterClient";

export default async function SupervisorRegisterPage() {
  const session = await auth();

  // If already logged in, redirect to home
  if (session) {
    redirect("/");
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <SupervisorRegisterClient departments={departments} />
  );
}
