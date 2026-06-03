"use client";

import { useState } from "react";
import { Store, Printer, Bell, Lock, ChevronRight } from "lucide-react";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="pb-3 mb-4 border-b border-slate-100">
      <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[12px] text-slate-600 pt-2 w-44 flex-shrink-0">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({
  defaultValue,
  placeholder,
}: {
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
    />
  );
}

function TextareaInput({
  defaultValue,
  rows = 3,
}: {
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <textarea
      defaultValue={defaultValue}
      rows={rows}
      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
    />
  );
}

function SelectInput({
  defaultValue,
  options,
}: {
  defaultValue?: string;
  options: string[];
}) {
  return (
    <select
      defaultValue={defaultValue}
      className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start gap-4">
      <label className="text-[12px] text-slate-600 w-44 flex-shrink-0 pt-0.5">
        {label}
      </label>
      <div className="flex-1">
        <button
          onClick={() => setOn(!on)}
          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </button>
        {description && (
          <p className="text-[11px] text-slate-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

const sections = [
  { id: "store", label: "Store Details", icon: Store },
  { id: "receipt", label: "Receipt Settings", icon: Printer },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account & Security", icon: Lock },
];

export default function SettingsPage() {
  const [active, setActive] = useState("store");

  return (
    <div className="p-5">
      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-44 flex-shrink-0 space-y-0.5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors ${active === s.id ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[12px] font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-5 py-5">
          {active === "store" && (
            <div className="space-y-4">
              <SectionHeader
                title="Store Details"
                description="Business information shown on receipts and invoices"
              />
              <Field label="Business Name">
                <TextInput defaultValue="Ntunda Supermarket" />
              </Field>
              <Field label="Address">
                <TextInput defaultValue="Kampala Road, Kampala" />
              </Field>
              <Field label="Phone Number">
                <TextInput defaultValue="+256 772 xxx xxx" />
              </Field>
              <Field label="Email">
                <TextInput defaultValue="ntunda@example.com" />
              </Field>
              <Field label="Currency">
                <SelectInput
                  defaultValue="UGX — Ugandan Shilling"
                  options={[
                    "UGX — Ugandan Shilling",
                    "USD — US Dollar",
                    "KES — Kenyan Shilling",
                  ]}
                />
              </Field>
              <Field label="Timezone">
                <SelectInput
                  defaultValue="Africa/Kampala (UTC+3)"
                  options={[
                    "Africa/Kampala (UTC+3)",
                    "Africa/Nairobi (UTC+3)",
                    "UTC",
                  ]}
                />
              </Field>
            </div>
          )}

          {active === "receipt" && (
            <div className="space-y-4">
              <SectionHeader
                title="Receipt Settings"
                description="Customise how receipts look when printed"
              />
              <Field label="Receipt Header">
                <TextareaInput
                  defaultValue={
                    "Ntunda Supermarket\nKampala Road, Kampala\nTel: +256 772 xxx xxx"
                  }
                />
              </Field>
              <Field label="Receipt Footer">
                <TextareaInput
                  defaultValue="Thank you for shopping with us!\nPlease come again."
                  rows={2}
                />
              </Field>
              <Toggle
                label="Show logo"
                description="Print business logo at the top of the receipt"
                defaultChecked
              />
              <Toggle
                label="Show contact info"
                description="Include phone number and address"
                defaultChecked
              />
              <Toggle
                label="Show VAT line"
                description="Display VAT/tax breakdown on receipt"
              />
              <Toggle
                label="Auto-print after sale"
                description="Automatically print receipt after every transaction"
                defaultChecked
              />
              <Field label="Copies per sale">
                <SelectInput
                  defaultValue="1 copy"
                  options={["1 copy", "2 copies", "3 copies"]}
                />
              </Field>
            </div>
          )}

          {active === "notifications" && (
            <div className="space-y-4">
              <SectionHeader
                title="Notifications"
                description="Control what alerts you receive and how"
              />
              <Toggle
                label="Low stock alerts"
                description="Get notified when a product drops below minimum quantity"
                defaultChecked
              />
              <Toggle
                label="Daily sales summary"
                description="Receive a summary of the day's sales at close of business"
                defaultChecked
              />
              <Toggle
                label="WhatsApp summaries"
                description="Send daily summaries via WhatsApp"
                defaultChecked
              />
              <Toggle
                label="SMS alerts"
                description="Send critical alerts via SMS"
              />
              <Toggle
                label="Overdue credit reminders"
                description="Alert when a customer credit account is overdue"
                defaultChecked
              />
              <Field label="WhatsApp Number">
                <TextInput defaultValue="+256 772 xxx xxx" />
              </Field>
              <Field label="Low stock threshold">
                <SelectInput
                  defaultValue="Below minimum quantity"
                  options={[
                    "Below minimum quantity",
                    "Below 5 units",
                    "Below 10 units",
                  ]}
                />
              </Field>
            </div>
          )}

          {active === "account" && (
            <div className="space-y-4">
              <SectionHeader title="Your Account" />
              <Field label="Display Name">
                <TextInput defaultValue="Namukasa Aisha" />
              </Field>
              <Field label="Email">
                <TextInput defaultValue="aisha@ntundasupermarket.ug" />
              </Field>
              <Field label="Phone">
                <TextInput defaultValue="+256 772 xxx xxx" />
              </Field>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <SectionHeader title="Change Password" />
                <div className="space-y-3">
                  <Field label="Current Password">
                    <input
                      type="password"
                      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                      placeholder="Enter current password"
                    />
                  </Field>
                  <Field label="New Password">
                    <input
                      type="password"
                      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                      placeholder="Enter new password"
                    />
                  </Field>
                  <Field label="Confirm Password">
                    <input
                      type="password"
                      className="w-full max-w-sm text-[12px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                      placeholder="Confirm new password"
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <SectionHeader title="Security" />
                <Toggle
                  label="Session timeout"
                  description="Automatically lock after 30 minutes of inactivity"
                  defaultChecked
                />
                <div className="mt-3">
                  <Toggle
                    label="Cashier PIN lock"
                    description="Require PIN before processing each sale"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-4 py-1.5 rounded-md transition-colors">
              Save Changes
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-500 text-[12px] font-medium px-4 py-1.5 rounded-md border border-slate-200 transition-colors">
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
