"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Service, ServiceFormState, emptyForm } from "./types";
import { ModalOverlay, FormField, inputClass } from "../../stock/components/shared";
import { useBranch } from "@/contexts/BranchContext";

interface Props {
  service: Service | null;
  categories: string[];
  onClose: () => void;
  onSaved: (s: Service) => void;
}

export default function ServiceModal({
  service,
  categories,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!service;
  const { selectedBranchId } = useBranch();
  const [form, setForm] = useState<ServiceFormState>(
    service
      ? {
          name: service.name,
          category: service.category,
          price: String(service.price),
          duration: service.duration || "",
          description: service.description || "",
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set =
    (key: keyof ServiceFormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Service name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        duration: form.duration.trim(),
        description: form.description.trim(),
        ...(!isEdit && { branchId: selectedBranchId || undefined }),
      };
      const saved = isEdit
        ? await apiRequest<Service>(`/api/services/${service._id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiRequest<Service>("/api/services", {
            method: "POST",
            body: JSON.stringify(body),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isEdit ? "Edit Service" : "Add Service"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <FormField label="Service Name" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Haircut, Phone Repair, Consultation"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <input
                className={inputClass}
                list="service-categories"
                value={form.category}
                onChange={set("category")}
                placeholder="e.g. Grooming"
              />
              <datalist id="service-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </FormField>
            <FormField label="Duration">
              <input
                className={inputClass}
                value={form.duration}
                onChange={set("duration")}
                placeholder="e.g. 45 min"
              />
            </FormField>
          </div>

          <FormField label="Price (UGX)" required>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.price}
              onChange={set("price")}
              placeholder="0"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="Optional notes about this service"
            />
          </FormField>

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
              disabled={saving}
              className="px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
