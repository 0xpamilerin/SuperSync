import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  
  const isAuthRoute = 
    nextUrl.pathname.startsWith("/login") || 
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/supervisor-login") ||
    nextUrl.pathname.startsWith("/supervisor-register") ||
    nextUrl.pathname.startsWith("/admin-login") ||
    nextUrl.pathname.startsWith("/admin-register");
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect based on role if they try to access login while already logged in
      const role = req.auth?.user?.role
      if (role === "ADMIN") return Response.redirect(new URL("/admin", nextUrl))
      if (role === "SUPERVISOR") return Response.redirect(new URL("/supervisor", nextUrl))
      return Response.redirect(new URL("/student", nextUrl))
    }
    return
  }
  
  if (!isLoggedIn) {
    // Redirect unauthenticated users to the appropriate login page based on the path they tried to access
    if (nextUrl.pathname.startsWith("/admin")) {
      return Response.redirect(new URL("/admin-login", nextUrl))
    }
    if (nextUrl.pathname.startsWith("/supervisor")) {
      return Response.redirect(new URL("/supervisor-login", nextUrl))
    }
    return Response.redirect(new URL("/login", nextUrl))
  }
  
  // Role-based protection
  const role = req.auth?.user?.role
  
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return Response.redirect(new URL("/unauthorized", nextUrl)) // Or just redirect to their dashboard
  }
  
  if (nextUrl.pathname.startsWith("/supervisor") && role !== "SUPERVISOR") {
    return Response.redirect(new URL("/unauthorized", nextUrl))
  }
  
  if (nextUrl.pathname.startsWith("/student") && role !== "STUDENT") {
    return Response.redirect(new URL("/unauthorized", nextUrl))
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
