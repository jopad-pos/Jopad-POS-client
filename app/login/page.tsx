"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError("")

    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value
    const remember = (form.elements.namedItem("remember") as HTMLInputElement)
      .checked

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed. Check your credentials.")
        return
      }

      const maxAge = remember ? 7 * 24 * 60 * 60 : undefined
      document.cookie = `jopad_token=${encodeURIComponent(data.token)}; path=/; samesite=lax${maxAge ? `; max-age=${maxAge}` : ""}`

      if (data.mustChangePassword) {
        router.push("/set-password")
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[860px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left info panel */}
        <div className="hidden md:flex flex-col justify-between w-[340px] flex-shrink-0 bg-slate-950 p-10">
          <div>
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-[11px]">JP</span>
              </div>
              <span className="text-white font-semibold text-sm">
                Jopad POS
              </span>
            </div>

            <h2 className="text-white text-xl font-semibold leading-snug mb-3">
              Your business, managed from anywhere.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor sales, track stock, manage staff, and keep your business
              running — all from one dashboard built for Ugandan businesses.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Real-time sales & stock tracking",
              "Offline POS with automatic sync",
              "Customer & supplier management",
              "Daily WhatsApp / SMS summaries",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </span>
                <span className="text-slate-400 text-[13px]">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-[11px]">
            jopadpos.com &nbsp;·&nbsp; Powered in Uganda
          </p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[11px]">JP</span>
            </div>
            <span className="font-semibold text-slate-900">Jopad POS</span>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-slate-900 mb-1">
              Sign in to your dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Enter the email and password for your business account.
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
                htmlFor="email"
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-slate-700"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-[13px] text-slate-600 cursor-pointer select-none"
              >
                Stay signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors mt-2"
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
            Don&apos;t have a Jopad POS account?{" "}
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Contact us to get started
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
