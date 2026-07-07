"use client";

import { useState, useEffect } from "react";
import { Store, Printer, Bell, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import {
  STAFF_ROLES,
  FEATURES,
  DEFAULT_STAFF_PERMISSIONS,
  type StaffRole,
  type FeatureKey,
} from "@/lib/permissions";

// ── Constants ────────────────────────────────────────────────────────────────

const CURRENCY_OPTIONS = [
  { value: "UGX", label: "UGX — Ugandan Shilling" },
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "TZS", label: "TZS — Tanzanian Shilling" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GHS", label: "GHS — Ghanaian Cedi" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
];

const TIMEZONE_OPTIONS = [
  { value: "Africa/Kampala", label: "Africa/Kampala (UTC+3)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (UTC+3)" },
  { value: "Africa/Dar_es_Salaam", label: "Africa/Dar es Salaam (UTC+3)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (UTC+1)" },
  { value: "Africa/Accra", label: "Africa/Accra (UTC+0)" },
  { value: "UTC", label: "UTC (UTC+0)" },
];

const COPIES_OPTIONS = [
  { value: 1, label: "1 copy" },
  { value: 2, label: "2 copies" },
  { value: 3, label: "3 copies" },
];

// ── API shape returned by GET /api/auth/me ───────────────────────────────────

interface UserData {
  name: string;
  email: string;
  role: string;
  businessName?: string;
  logoUrl?: string | null;
  storeEmail?: string;
  location?: string;
  phone?: string;
  currency?: string;
  timezone?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  receiptShowContactInfo?: boolean;
  receiptShowVatLine?: boolean;
  receiptAutoPrint?: boolean;
  receiptCopies?: number;
  staffPermissions?: Record<string, string[]>;
}

// ── Shared UI primitives ─────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-3 mb-4 border-b border-slate-100">
      <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[12px] text-slate-600 pt-2 w-44 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      className={`w-full max-w-sm text-[12px] text-slate-700 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none transition ${
        readOnly
          ? "bg-slate-100 cursor-not-allowed text-slate-400 focus:ring-0"
          : "bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:bg-white"
      }`}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
    />
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[12px] text-slate-600 w-44 flex-shrink-0 pt-0.5">{label}</label>
      <div className="flex-1">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </button>
        {description && <p className="text-[11px] text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}

function SaveBar({
  saving,
  result,
  onDiscard,
}: {
  saving: boolean;
  result: { ok: boolean; msg: string } | null;
  onDiscard: () => void;
}) {
  return (
    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
      {result && (
        <p
          className={`text-[12px] px-3 py-2 rounded-md border max-w-sm ${
            result.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {result.msg}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[12px] font-medium px-4 py-1.5 rounded-md transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving}
          className="bg-white hover:bg-slate-50 text-slate-500 text-[12px] font-medium px-4 py-1.5 rounded-md border border-slate-200 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

// ── Form state types ─────────────────────────────────────────────────────────

interface StoreForm {
  businessName: string;
  storeEmail: string;
  location: string;
  phone: string;
  currency: string;
  timezone: string;
}

interface ReceiptForm {
  header: string;
  footer: string;
  showContactInfo: boolean;
  showVatLine: boolean;
  autoPrint: boolean;
  copies: number;
}

interface AccountForm {
  name: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Main page ────────────────────────────────────────────────────────────────

const ALL_SECTIONS: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly: boolean;
}[] = [
  { id: "store", label: "Store Details", icon: Store, ownerOnly: true },
  { id: "receipt", label: "Receipt Settings", icon: Printer, ownerOnly: true },
  { id: "notifications", label: "Notifications", icon: Bell, ownerOnly: false },
  { id: "permissions", label: "Staff Access", icon: ShieldCheck, ownerOnly: true },
  { id: "account", label: "Account & Security", icon: Lock, ownerOnly: false },
];

function makePermissionsForm(saved?: Record<string, string[]>): Record<StaffRole, FeatureKey[]> {
  const result = {} as Record<StaffRole, FeatureKey[]>;
  for (const role of STAFF_ROLES) {
    result[role] = (saved?.[role] as FeatureKey[] | undefined) ?? [...DEFAULT_STAFF_PERMISSIONS[role]];
  }
  return result;
}

function makeStoreForm(d: UserData): StoreForm {
  return {
    businessName: d.businessName ?? "",
    storeEmail: d.storeEmail ?? "",
    location: d.location ?? "",
    phone: d.phone ?? "",
    currency: d.currency ?? "UGX",
    timezone: d.timezone ?? "Africa/Kampala",
  };
}

function makeReceiptForm(d: UserData): ReceiptForm {
  return {
    header:
      d.receiptHeader ??
      [d.businessName, d.location, d.phone ? `Tel: ${d.phone}` : ""]
        .filter(Boolean)
        .join("\n"),
    footer: d.receiptFooter ?? "Thank you for shopping with us!\nPlease come again.",
    showContactInfo: d.receiptShowContactInfo ?? true,
    showVatLine: d.receiptShowVatLine ?? false,
    autoPrint: d.receiptAutoPrint ?? true,
    copies: d.receiptCopies ?? 1,
  };
}

export default function SettingsPage() {
  const [active, setActive] = useState("store");
  const { refreshProfile } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const isOwner = userData?.role === "client";
  const sections = ALL_SECTIONS.filter((s) => !s.ownerOnly || isOwner);

  const [storeForm, setStoreForm] = useState<StoreForm>({
    businessName: "",
    storeEmail: "",
    location: "",
    phone: "",
    currency: "UGX",
    timezone: "Africa/Kampala",
  });
  const [receiptForm, setReceiptForm] = useState<ReceiptForm>({
    header: "",
    footer: "",
    showContactInfo: true,
    showVatLine: false,
    autoPrint: true,
    copies: 1,
  });
  const [accountForm, setAccountForm] = useState<AccountForm>({ name: "" });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [storeSaving, setStoreSaving] = useState(false);
  const [storeResult, setStoreResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoResult, setLogoResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [receiptSaving, setReceiptSaving] = useState(false);
  const [receiptResult, setReceiptResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountResult, setAccountResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordResult, setPasswordResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const [permissionsForm, setPermissionsForm] = useState<Record<StaffRole, FeatureKey[]>>(
    makePermissionsForm(),
  );
  const [permissionsSaving, setPermissionsSaving] = useState(false);
  const [permissionsResult, setPermissionsResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Fetch full user data once on mount
  useEffect(() => {
    apiRequest<UserData>("/api/auth/me")
      .then((data) => {
        setUserData(data);
        setStoreForm(makeStoreForm(data));
        setReceiptForm(makeReceiptForm(data));
        setAccountForm({ name: data.name });
        setPermissionsForm(makePermissionsForm(data.staffPermissions));
        // Staff can't open owner-only sections — land them on a visible one
        if (data.role !== "client" && ALL_SECTIONS.find((s) => s.id === "store")?.ownerOnly) {
          setActive((cur) => {
            const section = ALL_SECTIONS.find((s) => s.id === cur);
            return section && !section.ownerOnly ? cur : "notifications";
          });
        }
      })
      .catch(() => {/* silently fail */});
  }, []);

  // ── Store Details handlers ───────────────────────────────────────────────

  function setStore<K extends keyof StoreForm>(k: K, v: StoreForm[K]) {
    setStoreForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    setStoreSaving(true);
    setStoreResult(null);
    try {
      await apiRequest("/api/auth/profile", { method: "PUT", body: JSON.stringify(storeForm) });
      await refreshProfile();
      setStoreResult({ ok: true, msg: "Store details saved." });
    } catch (err) {
      setStoreResult({ ok: false, msg: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setStoreSaving(false);
    }
  }

  // ── Logo handlers ────────────────────────────────────────────────────────

  const LOGO_MAX_BYTES = 2 * 1024 * 1024;
  const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
      setLogoResult({ ok: false, msg: "Logo must be a PNG, JPEG, WEBP, or SVG image." });
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoResult({ ok: false, msg: "Logo must be under 2MB." });
      return;
    }

    setLogoUploading(true);
    setLogoResult(null);
    try {
      const form = new FormData();
      form.append("logo", file);
      const updated = await apiRequest<UserData>("/api/auth/logo", { method: "POST", body: form });
      setUserData(updated);
      await refreshProfile();
      setLogoResult({ ok: true, msg: "Logo updated." });
    } catch (err) {
      setLogoResult({ ok: false, msg: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleLogoRemove() {
    setLogoUploading(true);
    setLogoResult(null);
    try {
      const updated = await apiRequest<UserData>("/api/auth/logo", { method: "DELETE" });
      setUserData(updated);
      await refreshProfile();
      setLogoResult({ ok: true, msg: "Logo removed." });
    } catch (err) {
      setLogoResult({ ok: false, msg: err instanceof Error ? err.message : "Remove failed." });
    } finally {
      setLogoUploading(false);
    }
  }

  // ── Permissions handlers ─────────────────────────────────────────────────

  function togglePermission(role: StaffRole, featureKey: FeatureKey) {
    setPermissionsForm((prev) => {
      const current = prev[role] ?? [...DEFAULT_STAFF_PERMISSIONS[role]];
      const next = current.includes(featureKey)
        ? current.filter((f) => f !== featureKey)
        : [...current, featureKey];
      return { ...prev, [role]: next };
    });
  }

  async function handleSavePermissions(e: React.FormEvent) {
    e.preventDefault();
    setPermissionsSaving(true);
    setPermissionsResult(null);
    try {
      await apiRequest("/api/auth/permissions", {
        method: "PUT",
        body: JSON.stringify({ staffPermissions: permissionsForm }),
      });
      await refreshProfile();
      setPermissionsResult({ ok: true, msg: "Staff access permissions saved." });
    } catch (err) {
      setPermissionsResult({ ok: false, msg: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setPermissionsSaving(false);
    }
  }

  // ── Receipt Settings handlers ────────────────────────────────────────────

  function setReceipt<K extends keyof ReceiptForm>(k: K, v: ReceiptForm[K]) {
    setReceiptForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSaveReceipt(e: React.FormEvent) {
    e.preventDefault();
    setReceiptSaving(true);
    setReceiptResult(null);
    try {
      await apiRequest("/api/auth/receipt", {
        method: "PUT",
        body: JSON.stringify({
          receiptHeader: receiptForm.header,
          receiptFooter: receiptForm.footer,
          receiptShowContactInfo: receiptForm.showContactInfo,
          receiptShowVatLine: receiptForm.showVatLine,
          receiptAutoPrint: receiptForm.autoPrint,
          receiptCopies: receiptForm.copies,
        }),
      });
      setReceiptResult({ ok: true, msg: "Receipt settings saved." });
    } catch (err) {
      setReceiptResult({ ok: false, msg: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setReceiptSaving(false);
    }
  }

  // ── Account handlers ─────────────────────────────────────────────────────

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    setAccountSaving(true);
    setAccountResult(null);
    try {
      await apiRequest("/api/auth/account", {
        method: "PUT",
        body: JSON.stringify({ name: accountForm.name }),
      });
      await refreshProfile();
      setAccountResult({ ok: true, msg: "Account details saved." });
    } catch (err) {
      setAccountResult({ ok: false, msg: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordResult(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordResult({ ok: false, msg: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordResult({ ok: false, msg: "New password must be at least 8 characters." });
      return;
    }
    setPasswordSaving(true);
    try {
      await apiRequest("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordResult({ ok: true, msg: "Password changed successfully." });
    } catch (err) {
      setPasswordResult({ ok: false, msg: err instanceof Error ? err.message : "Change failed." });
    } finally {
      setPasswordSaving(false);
    }
  }

  const loading = !userData;

  return (
    <div className="p-5">
      <div className="flex gap-5">
        {/* Section nav */}
        <div className="w-44 flex-shrink-0 space-y-0.5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors ${
                  active === s.id
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[12px] font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-5 py-5">

          {/* ── Store Details ── */}
          {active === "store" && (
            <form onSubmit={handleSaveStore}>
              <div className="space-y-4">
                <SectionHeader
                  title="Store Details"
                  description="Business information shown on receipts and invoices"
                />
                <Field label="Logo">
                  <div className="flex items-center gap-3">
                    {userData?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userData.logoUrl}
                        alt="Business logo"
                        className="w-12 h-12 rounded-md object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[11px]">
                        No logo
                      </div>
                    )}
                    <label className="text-[12px] font-medium px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
                      {logoUploading ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept={LOGO_ACCEPTED_TYPES.join(",")}
                        onChange={handleLogoChange}
                        disabled={logoUploading}
                        className="hidden"
                      />
                    </label>
                    {userData?.logoUrl && (
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        disabled={logoUploading}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-md text-slate-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {logoResult && (
                    <p
                      className={`text-[11px] mt-1.5 ${logoResult.ok ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {logoResult.msg}
                    </p>
                  )}
                </Field>
                <Field label="Business Name">
                  <TextInput
                    value={storeForm.businessName}
                    onChange={(v) => setStore("businessName", v)}
                    placeholder="Your business name"
                  />
                </Field>
                <Field label="Address">
                  <TextInput
                    value={storeForm.location}
                    onChange={(v) => setStore("location", v)}
                    placeholder="City, Country"
                  />
                </Field>
                <Field label="Phone Number">
                  <TextInput
                    value={storeForm.phone}
                    onChange={(v) => setStore("phone", v)}
                    placeholder="+256 700 000 000"
                  />
                </Field>
                <Field label="Store Email">
                  <TextInput
                    value={storeForm.storeEmail}
                    onChange={(v) => setStore("storeEmail", v)}
                    type="email"
                    placeholder="store@example.com"
                  />
                </Field>
                <Field label="Currency">
                  <select
                    value={storeForm.currency}
                    onChange={(e) => setStore("currency", e.target.value)}
                    className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {CURRENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Timezone">
                  <select
                    value={storeForm.timezone}
                    onChange={(e) => setStore("timezone", e.target.value)}
                    className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {TIMEZONE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <SaveBar
                saving={storeSaving || loading}
                result={storeResult}
                onDiscard={() => {
                  if (userData) setStoreForm(makeStoreForm(userData));
                  setStoreResult(null);
                }}
              />
            </form>
          )}

          {/* ── Receipt Settings ── */}
          {active === "receipt" && (
            <form onSubmit={handleSaveReceipt}>
              <div className="space-y-4">
                <SectionHeader
                  title="Receipt Settings"
                  description="Customise how receipts look when printed"
                />
                <Field label="Receipt Header">
                  <Textarea
                    value={receiptForm.header}
                    onChange={(v) => setReceipt("header", v)}
                    rows={3}
                  />
                </Field>
                <Field label="Receipt Footer">
                  <Textarea
                    value={receiptForm.footer}
                    onChange={(v) => setReceipt("footer", v)}
                    rows={2}
                  />
                </Field>
                <Toggle
                  label="Show contact info"
                  description="Include phone number and address on the receipt"
                  checked={receiptForm.showContactInfo}
                  onChange={(v) => setReceipt("showContactInfo", v)}
                />
                <Toggle
                  label="Show VAT line"
                  description="Display VAT/tax breakdown on receipt"
                  checked={receiptForm.showVatLine}
                  onChange={(v) => setReceipt("showVatLine", v)}
                />
                <Toggle
                  label="Auto-print after sale"
                  description="Automatically print receipt after every transaction"
                  checked={receiptForm.autoPrint}
                  onChange={(v) => setReceipt("autoPrint", v)}
                />
                <Field label="Copies per sale">
                  <select
                    value={receiptForm.copies}
                    onChange={(e) => setReceipt("copies", Number(e.target.value))}
                    className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {COPIES_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <SaveBar
                saving={receiptSaving || loading}
                result={receiptResult}
                onDiscard={() => {
                  if (userData) setReceiptForm(makeReceiptForm(userData));
                  setReceiptResult(null);
                }}
              />
            </form>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <div className="space-y-4">
              <SectionHeader
                title="Notifications"
                description="Control what alerts you receive and how"
              />
              {[
                { label: "Low stock alerts", desc: "Get notified when a product drops below minimum quantity", def: true },
                { label: "Daily sales summary", desc: "Receive a summary of the day's sales at close of business", def: true },
                { label: "WhatsApp summaries", desc: "Send daily summaries via WhatsApp", def: true },
                { label: "SMS alerts", desc: "Send critical alerts via SMS", def: false },
                { label: "Overdue credit reminders", desc: "Alert when a customer credit account is overdue", def: true },
              ].map((t) => (
                <StaticToggle key={t.label} label={t.label} description={t.desc} defaultChecked={t.def} />
              ))}
              <Field label="WhatsApp Number">
                <TextInput value={userData?.phone ?? ""} readOnly />
              </Field>
              <Field label="Low stock threshold">
                <select className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Below minimum quantity</option>
                  <option>Below 5 units</option>
                  <option>Below 10 units</option>
                </select>
              </Field>
            </div>
          )}

          {/* ── Staff Access ── */}
          {active === "permissions" && isOwner && (
            <form onSubmit={handleSavePermissions}>
              <SectionHeader
                title="Staff Access"
                description="Control which sections each staff role can see in the dashboard"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-2 pr-4 text-[11px] font-semibold text-slate-500 whitespace-nowrap w-32">
                        Role
                      </th>
                      {FEATURES.map((f) => (
                        <th
                          key={f.key}
                          className="py-2 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center whitespace-nowrap"
                        >
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {STAFF_ROLES.map((role) => (
                      <tr key={role} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-4 text-[12px] font-medium text-slate-800 whitespace-nowrap">
                          {role}
                        </td>
                        {FEATURES.map((f) => {
                          const checked = permissionsForm[role]?.includes(f.key) ?? false;
                          return (
                            <td key={f.key} className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(role, f.key as FeatureKey)}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                                  checked
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-white border-slate-300 hover:border-slate-400"
                                }`}
                                aria-label={`${checked ? "Remove" : "Grant"} ${f.label} access for ${role}`}
                              >
                                {checked && (
                                  <svg
                                    className="w-2.5 h-2.5 text-white"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                  >
                                    <path
                                      d="M1 4l3 3 5-6"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Overview is always visible to all staff.
              </p>
              <SaveBar
                saving={permissionsSaving}
                result={permissionsResult}
                onDiscard={() => {
                  setPermissionsForm(makePermissionsForm(userData?.staffPermissions));
                  setPermissionsResult(null);
                }}
              />
            </form>
          )}

          {/* ── Account & Security ── */}
          {active === "account" && (
            <div className="space-y-6">
              {/* Account details */}
              <form onSubmit={handleSaveAccount}>
                <div className="space-y-4">
                  <SectionHeader title="Your Account" />
                  <Field label="Display Name">
                    <TextInput
                      value={accountForm.name}
                      onChange={(v) => setAccountForm({ name: v })}
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email">
                    <div className="flex flex-col gap-1">
                      <TextInput value={userData?.email ?? ""} readOnly />
                      <p className="text-[10px] text-slate-400 max-w-sm">
                        Login email can only be changed by your platform administrator.
                      </p>
                    </div>
                  </Field>
                  <Field label="Phone">
                    <TextInput value={userData?.phone ?? ""} readOnly />
                  </Field>
                </div>
                <SaveBar
                  saving={accountSaving || loading}
                  result={accountResult}
                  onDiscard={() => {
                    if (userData) setAccountForm({ name: userData.name });
                    setAccountResult(null);
                  }}
                />
              </form>

              {/* Change password */}
              <form onSubmit={handleChangePassword} className="pt-2 border-t border-slate-100">
                <div className="space-y-3">
                  <SectionHeader title="Change Password" />
                  <Field label="Current Password">
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      placeholder="Enter current password"
                      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </Field>
                  <Field label="New Password">
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      placeholder="At least 8 characters"
                      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </Field>
                  <Field label="Confirm Password">
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      placeholder="Repeat new password"
                      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </Field>
                  {passwordResult && (
                    <p
                      className={`text-[12px] px-3 py-2 rounded-md border max-w-sm ${
                        passwordResult.ok
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-red-50 border-red-200 text-red-600"
                      }`}
                    >
                      {passwordResult.msg}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[12px] font-medium px-4 py-1.5 rounded-md transition-colors"
                    >
                      {passwordSaving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Uncontrolled toggle for the static Notifications tab
function StaticToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-start gap-4">
      <label className="text-[12px] text-slate-600 w-44 flex-shrink-0 pt-0.5">{label}</label>
      <div className="flex-1">
        <button
          type="button"
          onClick={() => setOn(!on)}
          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </button>
        {description && <p className="text-[11px] text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}
