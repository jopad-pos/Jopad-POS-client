"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react"
import { useRouter } from "next/navigation"
import { getUser, type JWTUser } from "@/lib/auth"

interface AuthContextValue {
  user: JWTUser | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JWTUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    setUser(getUser())
  }, [])

  function logout() {
    document.cookie = "jopad_token=; max-age=0; path=/"
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
