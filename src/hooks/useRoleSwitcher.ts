import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth"

const STORAGE_KEY = "titanium_view_as"
const SYNC_EVENT = "titanium-role-switch"

type Role = "admin" | "reception" | "instructor" | "user"

export function useRoleSwitcher() {
  const { user } = useAuth()
  const realRole = (user?.role as Role) ?? "user"
  const isAdmin = realRole === "admin"

  const [viewAsRole, setViewAsRole] = useState<Role>(() => {
    if (typeof window === "undefined") return realRole
    return (localStorage.getItem(STORAGE_KEY) as Role) || realRole
  })

  // Sync across hook instances via custom event
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY) as Role | null
      setViewAsRole(stored || realRole)
    }
    window.addEventListener(SYNC_EVENT, handler)
    return () => window.removeEventListener(SYNC_EVENT, handler)
  }, [realRole])

  const setRole = useCallback((role: Role) => {
    localStorage.setItem(STORAGE_KEY, role)
    setViewAsRole(role)
    window.dispatchEvent(new Event(SYNC_EVENT))
  }, [])

  const resetRole = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setViewAsRole("admin")
    window.dispatchEvent(new Event(SYNC_EVENT))
  }, [])

  if (!isAdmin) {
    return { effectiveRole: realRole, isViewingAs: false, setRole, resetRole, isAdmin: false } as const
  }

  const effectiveRole = viewAsRole || "admin"
  const isViewingAs = effectiveRole !== "admin"

  return { effectiveRole, isViewingAs, setRole, resetRole, isAdmin: true } as const
}
