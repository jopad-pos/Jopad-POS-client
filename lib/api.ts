const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function getToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jopad_token="))
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    document.cookie = "jopad_token=; max-age=0; path=/"
    window.location.href = "/login"
    throw new ApiError(401, "Session expired")
  }

  const data = await res.json()
  if (!res.ok) throw new ApiError(res.status, data.message || "Request failed")
  return data as T
}
