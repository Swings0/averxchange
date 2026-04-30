"use client";

import { useState, useEffect } from "react";
import {
  Search, Save, Trash2, Clock, Plus, Minus,
  CheckCircle2, AlertCircle, Loader2, LogOut,
  TrendingUp, Shield, ChevronDown, X, Eye,
  Package, List, XCircle,
} from "lucide-react";
import { PLANS } from "@/lib/plans";

// ─── Stat fields ──────────────────────────────────────────────────
const STAT_FIELDS = [
  { key: "balance",         label: "Account Balance"  },
  { key: "totalProfit",     label: "Total Profit"     },
  { key: "bonus",           label: "Bonus"            },
  { key: "tradingAccounts", label: "Trading Account"  },
  { key: "referralBonus",   label: "Referral Bonus"   },
  { key: "totalDeposit",    label: "Total Deposit"    },
  { key: "totalWithdrawal", label: "Total Withdrawal" },
];

// ─── Delay helpers ────────────────────────────────────────────────
type Delay = { days: number; hours: number; mins: number; secs: number };
const toMs = (d: Delay) =>
  (d.days * 86400 + d.hours * 3600 + d.mins * 60 + d.secs) * 1000;

// ─── User stats modal ─────────────────────────────────────────────
function UserStatsModal({ user, onClose }: { user: any; onClose: () => void }) {
  const fmt = (n: number) => "$" + (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-white">{user.username}</h2>
            <p className="text-xs text-white/40 font-mono">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Account stats */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Account Stats</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Account Balance",  value: fmt(user.balance)        },
                { label: "Total Profit",     value: fmt(user.totalProfit)    },
                { label: "Trading Account",  value: fmt(user.tradingAccounts) },
                { label: "Bonus",            value: fmt(user.bonus)          },
                { label: "Referral Bonus",   value: fmt(user.referralBonus)  },
                { label: "Total Deposit",    value: fmt(user.totalDeposit)   },
                { label: "Total Withdrawal", value: fmt(user.totalWithdrawal) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 border border-white/[0.06] rounded-xl p-3">
                  <p className="text-xs text-white/40 mb-1">{label}</p>
                  <p className="text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active plans */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Active Plans ({user.plans?.length ?? 0})</p>
            {!user.plans?.length ? (
              <p className="text-sm text-white/30 bg-white/5 rounded-xl px-4 py-3">No active plans</p>
            ) : (
              <div className="space-y-2">
                {user.plans.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between bg-white/5 border border-white/[0.06] rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-white/40">
                        ${(p.price ?? 0).toLocaleString()} → +${(p.totalProfit ?? 0).toLocaleString()} · {p.duration}d
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-emerald-400">+${(p.dailyProfit ?? 0).toLocaleString()}/day</p>
                      <p className="text-xs text-white/30">{new Date(p.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deposits */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Recent Deposits</p>
            {!user.deposits?.length ? (
              <p className="text-sm text-white/30 bg-white/5 rounded-xl px-4 py-3">No deposits</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {user.deposits.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between bg-white/5 border border-white/[0.06] rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-sm text-white">${d.amount?.toLocaleString()}</p>
                      <p className="text-xs text-white/30">{d.method} · {new Date(d.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      d.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawals */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Recent Withdrawals</p>
            {!user.withdrawals?.length ? (
              <p className="text-sm text-white/30 bg-white/5 rounded-xl px-4 py-3">No withdrawals</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {user.withdrawals.map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between bg-white/5 border border-white/[0.06] rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-sm text-white">${w.amount?.toLocaleString()}</p>
                      <p className="text-xs text-white/30 font-mono truncate max-w-[160px]">{w.walletAddress}</p>
                      <p className="text-xs text-white/20">{new Date(w.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      w.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}>{w.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clear modal ──────────────────────────────────────────────────
function ClearModal({ field, onCancel, onConfirm, loading }: {
  field: string; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <AlertCircle size={32} className="text-rose-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Clear {field}?</h2>
        <p className="text-white/50 text-sm mb-6">This will reset the user&apos;s {field} to $0.00. Are you sure?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/10 transition text-sm font-medium">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />} Yes, Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delay input ──────────────────────────────────────────────────
function DelayInput({ value, onChange }: { value: Delay; onChange: (v: Delay) => void }) {
  return (
    <div className="flex items-center gap-1">
      {(["days","hours","mins","secs"] as const).map((u) => (
        <div key={u} className="flex flex-col items-center">
          <input type="number" min={0} value={value[u]}
            onChange={(e) => onChange({ ...value, [u]: parseInt(e.target.value) || 0 })}
            className="w-12 bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-white text-xs text-center focus:outline-none focus:border-cyan-400" />
          <span className="text-[10px] text-white/30 mt-0.5 capitalize">{u}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Row ──────────────────────────────────────────────────────
function StatRow({ fieldKey, label, userEmail, onSuccess, onError }: {
  fieldKey: string; label: string; userEmail: string;
  onSuccess: (msg: string) => void; onError: (msg: string) => void;
}) {
  const [value, setValue] = useState("");
  const [delay, setDelay] = useState<Delay>({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSave = async () => {
    if (!value) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, field: fieldKey, value, delayMs: toMs(delay) }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error); return; }
      onSuccess(data.message);
      setValue("");
    } catch { onError("Network error"); }
    finally { setSaving(false); }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/admin/update-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, field: fieldKey, clearField: true, delayMs: toMs(delay) }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error); return; }
      onSuccess(`${label} cleared`);
    } catch { onError("Network error"); }
    finally { setClearing(false); setShowClearModal(false); }
  };

  return (
    <>
      {showClearModal && <ClearModal field={label} onCancel={() => setShowClearModal(false)} onConfirm={handleClear} loading={clearing} />}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[120px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00"
              className="w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-400 transition" />
          </div>
          <DelayInput value={delay} onChange={setDelay} />
          <button onClick={handleSave} disabled={saving || !value}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-semibold hover:bg-cyan-500/30 disabled:opacity-40 transition-all">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
          </button>
          <button onClick={() => setShowClearModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-500/30 transition-all">
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Plan Slot ────────────────────────────────────────────────────
function PlanSlot({ index, onChange }: { index: number; onChange: (v: any) => void }) {
  const [planId, setPlanId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customDailyProfit, setCustomDailyProfit] = useState("");
  const [customTotalProfit, setCustomTotalProfit] = useState("");
  const [durationMode, setDurationMode] = useState<"days"|"custom">("days");
  const [durationDays, setDurationDays] = useState("21");
  const [customDuration, setCustomDuration] = useState<Delay>({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [open, setOpen] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === planId);

  const emit = (overrides: any = {}) => {
    const durationSeconds = durationMode === "custom"
      ? (customDuration.days * 86400 + customDuration.hours * 3600 + customDuration.mins * 60 + customDuration.secs)
      : 0;
    onChange({
      planId: planId || "custom",
      planName: customName || selectedPlan?.name || "Custom Plan",
      price: parseFloat(customPrice) || selectedPlan?.price || 0,
      dailyProfit: parseFloat(customDailyProfit) || selectedPlan?.dailyProfit || 0,
      totalProfit: parseFloat(customTotalProfit) || selectedPlan?.totalProfit || 0,
      profitPct: selectedPlan?.profitPct || 0,
      durationDays: parseInt(durationDays) || 21,
      durationSeconds,
      ...overrides,
    });
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
      <p className="text-xs text-white/40 uppercase tracking-wider">Plan {index + 1}</p>

      {/* Plan name (custom override) */}
      <div>
        <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Plan Name (custom)</label>
        <input
          type="text"
          value={customName}
          onChange={(e) => { setCustomName(e.target.value); emit({ planName: e.target.value || selectedPlan?.name || "Custom Plan" }); }}
          placeholder={selectedPlan?.name || "Enter custom plan name..."}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* Plan preset selector */}
      <div className="relative">
        <button onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white hover:border-white/20 transition">
          <span className="text-white/60">{selectedPlan ? `Use preset: ${selectedPlan.name}` : "Use a preset plan (optional)"}</span>
          <ChevronDown size={14} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f1f35] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl max-h-64 overflow-y-auto">
            <button onClick={() => { setPlanId(""); setOpen(false); emit({}); }}
              className="w-full px-4 py-2.5 hover:bg-white/10 transition text-sm text-left text-white/40">
              No preset / Custom only
            </button>
            {PLANS.map((p) => (
              <button key={p.id} onClick={() => {
                setPlanId(p.id); setOpen(false);
                if (!customName) setCustomName(p.name);
                setCustomPrice(String(p.price));
                setCustomDailyProfit(String(p.dailyProfit));
                setCustomTotalProfit(String(p.totalProfit));
                setDurationDays(String(p.duration));
                emit({ planId: p.id, planName: customName || p.name, price: p.price, dailyProfit: p.dailyProfit, totalProfit: p.totalProfit, durationDays: p.duration });
              }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 transition text-sm text-left">
                <span className="text-white">{p.name}</span>
                <span className="text-white/40 text-xs">${p.price.toLocaleString()} → +${p.totalProfit.toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price, daily profit, total profit */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Price ($)", val: customPrice, set: (v: string) => { setCustomPrice(v); emit({ price: parseFloat(v) }); } },
          { label: "Daily Profit ($)", val: customDailyProfit, set: (v: string) => { setCustomDailyProfit(v); emit({ dailyProfit: parseFloat(v) }); } },
          { label: "Total Profit ($)", val: customTotalProfit, set: (v: string) => { setCustomTotalProfit(v); emit({ totalProfit: parseFloat(v) }); } },
        ].map(({ label, val, set }) => (
          <div key={label} className="space-y-1">
            <label className="text-[10px] text-white/30 uppercase">{label}</label>
            <input type="number" value={val} onChange={(e) => set(e.target.value)}
              placeholder={label.includes("Price") ? "0" : "0.00"}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 transition" />
          </div>
        ))}
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Duration:</label>
          {["days","custom"].map((m) => (
            <button key={m} onClick={() => setDurationMode(m as any)}
              className={`text-xs px-3 py-1 rounded-lg border transition capitalize ${durationMode === m ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-white/10 text-white/40 hover:border-white/20"}`}>
              {m}
            </button>
          ))}
        </div>
        {durationMode === "days" ? (
          <div className="relative">
            <input type="number" value={durationDays}
              onChange={(e) => { setDurationDays(e.target.value); emit({ durationDays: parseInt(e.target.value) }); }}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 pr-12 transition" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">days</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {(["days","hours","mins","secs"] as const).map((u) => (
              <div key={u} className="flex flex-col items-center">
                <input type="number" min={0} value={customDuration[u]}
                  onChange={(e) => {
                    const next = { ...customDuration, [u]: parseInt(e.target.value) || 0 };
                    setCustomDuration(next);
                    const secs = next.days * 86400 + next.hours * 3600 + next.mins * 60 + next.secs;
                    emit({ durationSeconds: secs });
                  }}
                  className="w-14 bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-white text-xs text-center focus:outline-none focus:border-cyan-400" />
                <span className="text-[10px] text-white/30 mt-0.5 capitalize">{u}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [userFound, setUserFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error" } | null>(null);

  // Modals
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Pending deposits
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [processingDeposit, setProcessingDeposit] = useState<string | null>(null);

  // Plans
  const [planCount, setPlanCount] = useState(1);
  const [planSlots, setPlanSlots] = useState<any[]>([{}]);
  const [planDelay, setPlanDelay] = useState<Delay>({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [processingPlans, setProcessingPlans] = useState(false);

  // User current plans
  const [showUserPlans, setShowUserPlans] = useState(false);
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [loadingUserPlans, setLoadingUserPlans] = useState(false);
  const [removingPlan, setRemovingPlan] = useState<string | null>(null);

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch pending deposits on mount
  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await fetch("/api/admin/deposits");
        const data = await res.json();
        setDeposits(data.deposits ?? []);
      } catch {}
      finally { setLoadingDeposits(false); }
    };
    fetchDeposits();
    const id = setInterval(fetchDeposits, 30000); // poll every 30s
    return () => clearInterval(id);
  }, []);

  const handleDepositAction = async (transactionId: string, action: "approve" | "decline") => {
    setProcessingDeposit(transactionId);
    try {
      const res = await fetch("/api/admin/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "error"); return; }
      showToast(data.message, "success");
      setDeposits((prev) => prev.filter((d) => d.id !== transactionId));
    } catch { showToast("Network error", "error"); }
    finally { setProcessingDeposit(null); }
  };

  const handleSearch = async () => {
    if (!email) return;
    setSearching(true);
    setShowUserPlans(false);
    try {
      const res = await fetch(`/api/admin/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) { showToast("User not found", "error"); setUserFound(false); return; }
      setUserData(data);
      setSearchedEmail(email);
      setUserFound(true);
      setUserPlans(data.plans ?? []);
      showToast("User found", "success");
    } catch { showToast("Network error", "error"); }
    finally { setSearching(false); }
  };

  const handleRemovePlan = async (planId: string) => {
    setRemovingPlan(planId);
    try {
      const res = await fetch("/api/admin/remove-plan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) { showToast("Failed to remove plan", "error"); return; }
      setUserPlans((prev) => prev.filter((p) => p.id !== planId));
      showToast("Plan removed", "success");
    } catch { showToast("Network error", "error"); }
    finally { setRemovingPlan(null); }
  };

  const updatePlanCount = (c: number) => {
    const n = Math.max(1, Math.min(5, c));
    setPlanCount(n);
    setPlanSlots(Array(n).fill(null).map(() => ({})));
  };

  const handlePlanSlotChange = (i: number, val: any) => {
    setPlanSlots((prev) => { const next = [...prev]; next[i] = val; return next; });
  };

  const handleProcessPlans = async () => {
    if (!searchedEmail) { showToast("Search for a user first", "error"); return; }
    const validPlans = planSlots.filter((p) => p && (p.planName || p.dailyProfit || p.totalProfit));
    if (!validPlans.length) { showToast("Fill in at least one plan", "error"); return; }
    setProcessingPlans(true);
    try {
      const res = await fetch("/api/admin/update-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchedEmail, plans: validPlans, delayMs: toMs(planDelay) }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "error"); return; }
      showToast(data.message, "success");
      setPlanSlots(Array(planCount).fill(null).map(() => ({})));
      // Refresh user plans list
      if (showUserPlans) {
        const refreshed = await fetch(`/api/admin/user?email=${encodeURIComponent(searchedEmail)}`);
        const refreshedData = await refreshed.json();
        setUserPlans(refreshedData.plans ?? []);
      }
    } catch { showToast("Network error", "error"); }
    finally { setProcessingPlans(false); }
  };

  return (
    <div className="min-h-screen bg-[#080f1a] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-medium shadow-xl ${
          toast.type === "success"
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/20 border-rose-500/30 text-rose-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Stats modal */}
      {showStatsModal && userData && (
        <UserStatsModal user={userData} onClose={() => setShowStatsModal(false)} />
      )}

      {/* Top bar */}
      <div className="h-16 bg-[#0b1524] border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Shield size={16} className="text-cyan-400" />
          </div>
          <span className="font-bold text-white tracking-wide">AverXchange Admin</span>
        </div>
        <a href="/api/admin/logout" className="flex items-center gap-2 text-sm text-white/50 hover:text-rose-400 transition-colors">
          <LogOut size={16} /> Logout
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* ── Search ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Target User</h2>
          <div className="flex gap-3 flex-wrap">
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter user email address"
              className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-cyan-400 transition" />
            <button onClick={handleSearch} disabled={searching || !email}
              className="flex items-center gap-2 px-5 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-500/30 disabled:opacity-40 transition-all">
              {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {searching ? "Searching..." : "Search"}
            </button>

            {/* Show user account stats button */}
            {userFound && (
              <button onClick={() => setShowStatsModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded-xl text-sm font-semibold hover:bg-violet-500/30 transition-all">
                <Eye size={15} /> Show User Account Stats
              </button>
            )}
          </div>
          {userFound && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> User found: <span className="font-mono ml-1">{searchedEmail}</span>
              <span className="ml-2 text-white/30">({userData?.username})</span>
            </p>
          )}
        </div>

        {/* ── Pending Deposits ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
              Pending Deposits
              {deposits.length > 0 && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full">
                  {deposits.length} pending
                </span>
              )}
            </h2>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {loadingDeposits ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-white/30" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-8 text-center">
              <CheckCircle2 size={24} className="text-emerald-400/40 mx-auto mb-2" />
              <p className="text-sm text-white/30">No pending deposits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((d) => (
                <div key={d.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{d.userName}</p>
                      <span className="text-xs text-white/30 font-mono">{d.userEmail}</span>
                    </div>
                    <p className="text-xs text-white/50">
                      <span className="text-emerald-400 font-bold text-sm">${d.amount?.toLocaleString()}</span>
                      {" "}via {d.paymentMethod}
                      {d.proofFileName && <span className="ml-2 text-white/30">· Proof: {d.proofFileName}</span>}
                    </p>
                    <p className="text-xs text-white/25">
                      {new Date(d.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDepositAction(d.id, "approve")}
                      disabled={processingDeposit === d.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 disabled:opacity-40 transition-all"
                    >
                      {processingDeposit === d.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleDepositAction(d.id, "decline")}
                      disabled={processingDeposit === d.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-500/30 disabled:opacity-40 transition-all"
                    >
                      {processingDeposit === d.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 1: Update Stats ── */}
        {userFound && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest whitespace-nowrap">Update User Stats Manually</h2>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STAT_FIELDS.map((f) => (
                <StatRow key={f.key} fieldKey={f.key} label={f.label} userEmail={searchedEmail}
                  onSuccess={(msg) => showToast(msg, "success")}
                  onError={(msg) => showToast(msg, "error")} />
              ))}
            </div>
          </div>
        )}

        {/* ── Section 2: Update Plans ── */}
        {userFound && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest whitespace-nowrap">Update User Plans</h2>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* User current plans toggle */}
            <button
              onClick={() => setShowUserPlans((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <List size={15} />
              User Current Plans
              {userPlans.length > 0 && (
                <span className="ml-1 bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {userPlans.length} active
                </span>
              )}
              <ChevronDown size={14} className={`ml-auto transition-transform ${showUserPlans ? "rotate-180" : ""}`} />
            </button>

            {/* Current plans list */}
            {showUserPlans && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                {userPlans.length === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-5 text-sm text-white/30">
                    <Package size={16} className="text-white/20" />
                    User has no active plans
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {userPlans.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition">
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs text-white/40">
                            ${(p.price ?? 0).toLocaleString()} · +${(p.dailyProfit ?? 0).toLocaleString()}/day · {p.duration}d
                          </p>
                          <p className="text-xs text-white/25">
                            Ends: {new Date(p.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemovePlan(p.id)}
                          disabled={removingPlan === p.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-500/30 disabled:opacity-40 transition-all"
                        >
                          {removingPlan === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Plan count selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">Number of plans to add:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updatePlanCount(planCount - 1)}
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition text-white">
                  <Minus size={14} />
                </button>
                <span className="text-white font-bold w-6 text-center">{planCount}</span>
                <button onClick={() => updatePlanCount(planCount + 1)}
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition text-white">
                  <Plus size={14} />
                </button>
                <span className="text-xs text-white/30">(max 5)</span>
              </div>
            </div>

            {/* Plan slots */}
            <div className="space-y-3">
              {Array.from({ length: planCount }).map((_, i) => (
                <PlanSlot key={i} index={i} onChange={(val) => handlePlanSlotChange(i, val)} />
              ))}
            </div>

            {/* Activation delay */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
              <p className="text-sm font-semibold text-white/60 flex items-center gap-2">
                <Clock size={14} /> Plan Activation Timing
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-white/40">Activate after:</span>
                <DelayInput value={planDelay} onChange={setPlanDelay} />
                <button onClick={() => setPlanDelay({ days: 0, hours: 0, mins: 0, secs: 0 })}
                  className="text-xs px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition">
                  Instant
                </button>
              </div>
              <p className="text-xs text-white/25">
                {toMs(planDelay) === 0
                  ? "✓ Plans will appear on user dashboard immediately"
                  : `Plans will appear after ${planDelay.days}d ${planDelay.hours}h ${planDelay.mins}m ${planDelay.secs}s`}
              </p>
            </div>

            {/* Preview */}
            {planSlots.some((p) => p && p.totalProfit) && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Combined Total Profit</span>
                  <span className="text-lg font-bold text-emerald-400">
                    +${planSlots.reduce((s, p) => s + (parseFloat(p?.totalProfit) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Combined Daily</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    +${planSlots.reduce((s, p) => s + (parseFloat(p?.dailyProfit) || 0), 0).toLocaleString()}/day
                  </span>
                </div>
              </div>
            )}

            {/* Process */}
            <button onClick={handleProcessPlans} disabled={processingPlans}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20">
              {processingPlans
                ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                : <><TrendingUp size={18} /> Process Plans</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}