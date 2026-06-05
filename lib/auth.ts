export interface JWTUser {
  id: string
  email: string
  role: "client" | "staff"
  clientId: string | null
  iat: number
  exp: number
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jopad_token="))
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
}

export function decodeToken(token: string): JWTUser | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(b64)) as JWTUser
  } catch {
    return null
  }
}

export function getUser(): JWTUser | null {
  const token = getToken()
  return token ? decodeToken(token) : null
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  return !payload || payload.exp * 1000 < Date.now()
}
