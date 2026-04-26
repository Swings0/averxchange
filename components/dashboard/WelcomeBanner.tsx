"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";

export default function WelcomeBanner({
  hasActivePlan,
}: {
  hasActivePlan: boolean;
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const dismiss = (id: string) => setDismissed((p) => [...p, id]);

  const banners = [
    !hasActivePlan && {
      id: "buy-plan",
      message: "Welcome to AverXchange. Please buy a plan to start earning.",
      classes:
        "bg-indigo-500/10 border-indigo-500/25 text-indigo-300",
    },
    {
      id: "welcome",
      message: "Welcome to AverXchange — your trusted investment platform.",
      classes:
        "bg-cyan-500/10 border-cyan-500/25 text-cyan-300",
    },
  ].filter(Boolean) as { id: string; message: string; classes: string }[];

  const visible = banners.filter((b) => !dismissed.includes(b.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      {visible.map((b) => (
        <div
          key={b.id}
          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${b.classes}`}
        >
          <div className="flex items-center gap-2">
            <Info size={15} className="flex-shrink-0 opacity-70" />
            <span>{b.message}</span>
          </div>
          <button
            onClick={() => dismiss(b.id)}
            className="ml-4 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}