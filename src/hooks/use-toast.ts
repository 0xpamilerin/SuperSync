"use client"

import * as React from "react"
import { toast as baseToast } from "@/components/ui/toast"

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading"

export interface ToastOptions {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  type?: "default" | "error" | "destructive" | "success" | "warning" | "info" | "loading"
  duration?: number
  action?: React.ReactNode
}

function resolveType(options: ToastOptions): ToastType {
  if (options.variant === "destructive" || options.type === "error" || options.type === "destructive") {
    return "error"
  }
  if (options.variant === "success" || options.type === "success") {
    return "success"
  }
  if (options.variant === "warning" || options.type === "warning") {
    return "warning"
  }
  if (options.type === "loading") {
    return "loading"
  }
  return "info"
}

export function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    return baseToast.add({
      title: options,
      type: "info",
    })
  }

  const type = resolveType(options)

  return baseToast.add({
    title: options.title,
    description: options.description,
    type,
  })
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string) => {
      if (id) {
        baseToast.close(id)
      }
    },
  }
}
