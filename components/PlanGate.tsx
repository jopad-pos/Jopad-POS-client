"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_GATED_FEATURES, type FeatureKey, type PlanTier } from "@/lib/permissions";

const PLAN_HIGHLIGHTS: Record<PlanTier, string[]> = {
  Standard: [],
  Plus: [
    "Quotations & invoices",
    "Barcode & label generation",
    "Full accounting suite (P&L, Balance sheet, Cash flow)",
    "Unlimited staff users",
    "SMS Center & multi-currency support",
  ],
  Enterprise: [
    "Everything in Plus",
    "Manufacturing module & Bill of Materials",
    "Field sales mobile app",
    "Real-time field sync",
    "Dedicated account support",
  ],
};

interface PlanGateProps {
  featureKey: FeatureKey;
  children?: React.ReactNode;
}

export default function PlanGate({ featureKey, children }: PlanGateProps) {
  const { profile } = useAuth();

  // While profile/features are loading, render children normally
  if (!profile?.planFeatures) return <>{children}</>;

  if (profile.planFeatures.includes(featureKey)) return <>{children}</>;

  const required: PlanTier = PLAN_GATED_FEATURES[featureKey] ?? "Plus";
  const isOwner = profile.role === "client";

  return (
    <div className="flex items-center justify-center flex-1 px-6 py-16">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-blue-600" />
        </div>

        <span className="inline-block text-[11px] font-semibold bg-blue-600 text-white px-2.5 py-1 rounded mb-3 uppercase tracking-wide">
          {required} Plan
        </span>

        <h2 className="text-slate-900 text-xl font-semibold mb-2">
          Upgrade to unlock this feature
        </h2>

        <p className="text-slate-500 text-sm mb-6">
          {isOwner
            ? `This feature is included in the ${required} plan. Contact support to upgrade your subscription.`
            : `This feature requires the ${required} plan. Ask your business owner to upgrade.`}
        </p>

        {isOwner && PLAN_HIGHLIGHTS[required].length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 text-left mb-6">
            <p className="text-slate-700 text-xs font-semibold mb-2 uppercase tracking-wide">
              What you get with {required}
            </p>
            <ul className="space-y-1.5">
              {PLAN_HIGHLIGHTS[required].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-500 text-sm">
                  <span className="mt-0.5 text-blue-500 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-slate-400 text-xs">
          Contact{" "}
          <span className="font-medium text-slate-500">support@jopadpos.com</span>{" "}
          to upgrade your plan.
        </p>
      </div>
    </div>
  );
}
