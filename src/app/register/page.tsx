import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  const session = await auth();

  // If already logged in, redirect to home
  if (session) {
    redirect("/");
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <RegisterClient departments={departments} />
  );
}
