"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import { getUser, decodeToken, type JWTUser } from "@/lib/auth"
import { apiRequest } from "@/lib/api"

export interface BusinessProfile {
  name: string
  email: string
  role: "client" | "staff"
  staffRole?: string | null
  businessName?: string
  storeEmail?: string
  location?: string
  phone?: string
  currency?: string
  timezone?: string
  plan?: string
  planFeatures?: string[]
  staffPermissions?: Record<string, string[]>
}

interface AuthContextValue {
  user: JWTUser | null
  profile: BusinessProfile | null
  login: (token: string, maxAge?: number) => Promise<void>
  refreshProfile: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  login: async () => {},
  refreshProfile: async () => {},
  logout: () => {},
})

async function fetchProfile(): Promise<BusinessProfile | null> {
  try {
    const data = await apiRequest<Record<string, unknown>>("/api/auth/me")
    const isClient = data.role === "client"
    type ParentClient = Record<string, unknown> | null
    const parent = data.clientId as ParentClient
    const clientData = isClient
      ? {
          businessName: data.businessName as string | undefined,
          storeEmail: data.storeEmail as string | undefined,
          location: data.location as string | undefined,
          phone: data.phone as string | undefined,
          currency: data.currency as string | undefined,
          timezone: data.timezone as string | undefined,
          plan: data.plan as string | undefined,
          staffPermissions: data.staffPermissions as Record<string, string[]> | undefined,
        }
      : {
          businessName: parent?.businessName as string | undefined,
          storeEmail: parent?.storeEmail as string | undefined,
          location: parent?.location as string | undefined,
          phone: parent?.phone as string | undefined,
          currency: parent?.currency as string | undefined,
          timezone: parent?.timezone as string | undefined,
          plan: parent?.plan as string | undefined,
          staffPermissions: parent?.staffPermissions as Record<string, string[]> | undefined,
        }
    return {
      name: data.name as string,
      email: data.email as string,
      role: data.role as "client" | "staff",
      staffRole: data.staffRole as string | null | undefined,
      planFeatures: data.planFeatures as string[] | undefined,
      ...clientData,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JWTUser | null>(null)
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const router = useRouter()

  const refreshProfile = useCallback(async () => {
    const p = await fetchProfile()
    setProfile(p)
  }, [])

  const login = useCallback(async (token: string, maxAge?: number) => {
    document.cookie = `jopad_token=${encodeURIComponent(token)}; path=/; samesite=lax${maxAge ? `; max-age=${maxAge}` : ""}`
    const decoded = decodeToken(token)
    setUser(decoded)
    if (decoded) {
      const p = await fetchProfile()
      setProfile(p)
    }
  }, [])

  useEffect(() => {
    const decoded = getUser()
    setUser(decoded)
    if (decoded) {
      refreshProfile()
    }
  }, [refreshProfile])

  function logout() {
    document.cookie = "jopad_token=; max-age=0; path=/"
    setUser(null)
    setProfile(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, profile, login, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
