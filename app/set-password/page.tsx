"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"

export default function SetPasswordPage() {
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError("")

    const form = e.currentTarget
    const newPassword = (
      form.elements.namedItem("newPassword") as HTMLInputElement
    ).value
    const confirmPassword = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setPending(false)
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      setPending(false)
      return
    }

    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/set-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to set password.")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Could not reach the server.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[11px]">JP</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">
              Jopad POS
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-1">
            Set your password
          </h1>
          <p className="text-sm text-slate-500">
            Your account requires a new password before you can continue.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="newPassword"
              className="block text-[13px] font-medium text-slate-700 mb-1.5"
            >
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[13px] font-medium text-slate-700 mb-1.5"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors mt-2"
          >
            {pending ? "Saving…" : "Set Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  )
}
