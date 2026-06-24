"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { StaffMember } from "./types";
import { ModalOverlay, FormField, inputCls } from "./shared";

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;

  const rand = (chars: string) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return chars[buf[0] % chars.length];
  };

  const chars = [rand(upper), rand(lower), rand(digits), rand(symbols),
    ...Array.from({ length: 8 }, () => rand(all))];

  for (let i = chars.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

interface Props {
  staff: StaffMember;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SetPasswordModal({ staff, onClose, onUpdated }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    const pw = generatePassword();
    setPassword(pw);
    setConfirm(pw);
    setShowPw(true);
    setCopied(false);
    setError("");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/api/staff/${staff._id}`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to set password");
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-0.5">
          Set Password
        </h2>
        <p className="text-[12px] text-slate-400 mb-4">
          {staff.name} &middot; {staff.email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="New Password" required>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setCopied(false);
                }}
                className={`${inputCls} pr-16`}
                placeholder="Min 8 characters"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy password"
                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  title={showPw ? "Hide password" : "Show password"}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPw ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </FormField>

          <FormField label="Confirm Password" required>
            <input
              required
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              placeholder="Re-enter password"
            />
          </FormField>

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-blue-600 border border-blue-200 rounded-md py-2 hover:bg-blue-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate strong password
          </button>

          {error && <p className="text-[12px] text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {loading ? "Saving..." : "Set Password"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
