"use client";

import { useState, useEffect } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Loader2, TrendingUp } from "lucide-react";

// ─── Plan config ──────────────────────────────────────────────────
const PLANS = [
  { id: "bronze",   name: "Bronze Plan",   min: 500,   max: 1200,  profit: 9,    duration: 14, color: "from-amber-600 to-yellow-500",    border: "border-amber-500/30",   badge: "bg-amber-500/20 text-amber-300"   },
  { id: "silver",   name: "Silver Plan",   min: 1000,  max: 2100,  profit: 10,   duration: 14, color: "from-slate-400 to-gray-300",      border: "border-slate-400/30",   badge: "bg-slate-400/20 text-slate-300"   },
  { id: "gold",     name: "Gold Plan",     min: 2000,  max: 5200,  profit: 11.5, duration: 21, color: "from-yellow-400 to-amber-400",    border: "border-yellow-400/30",  badge: "bg-yellow-400/20 text-yellow-300" },
  { id: "platinum", name: "Platinum Plan", min: 5000,  max: 15000, profit: 12,   duration: 21, color: "from-cyan-400 to-teal-400",       border: "border-cyan-400/30",    badge: "bg-cyan-400/20 text-cyan-300"     },
  { id: "diamond",  name: "Diamond Plan",  min: 10000, max: 20000, profit: 13.5, duration: 21, color: "from-blue-400 to-indigo-500",     border: "border-blue-400/30",    badge: "bg-blue-400/20 text-blue-300"     },
  { id: "elite",    name: "Elite Plan",    min: 20000, max: 40000, profit: 14.5, duration: 30, color: "from-violet-500 to-purple-600",   border: "border-violet-500/30",  badge: "bg-violet-500/20 text-violet-300" },
  { id: "legacy",   name: "Legacy Plan",   min: 40000, max: 50000, profit: 15.5, duration: 30, color: "from-rose-500 to-pink-600",       border: "border-rose-500/30",    badge: "bg-rose-500/20 text-rose-300"     },
] as const;

type Plan = typeof PLANS[number];

// Quick amounts per plan range
function quickAmounts(plan: Plan): number[] {
  const { min, max } = plan;
  const step = (max - min) / 5;
  return [min, Math.round(min + step), Math.round(min + step * 2), Math.round(min + step * 3), Math.round(min + step * 4), max];
}

// ─── Success Modal ────────────────────────────────────────────────
function SuccessModal({ planName, onClose }: { planName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Purchase Successful!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          You have successfully purchased the <span className="text-white font-semibold">{planName}</span>. 
          Please be patient as we process your package. You will receive a confirmation email shortly.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function TradingPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setBalance(d.balance ?? 0)).catch(() => {});
  }, []);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setDropdownOpen(false);
    setAmount("");
    setError("");
  };

  const handleQuickAmount = (amt: number) => {
    setAmount(String(amt));
    setError("");
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    setError("");
  };

  const handleInvest = async () => {
    setError("");
    const amt = parseFloat(amount);

    if (!amount || isNaN(amt)) { setError("Please enter an amount to invest."); return; }

    if (amt < selectedPlan.min || amt > selectedPlan.max) {
      setError(`Amount must be between $${selectedPlan.min.toLocaleString()} and $${selectedPlan.max.toLocaleString()} for the ${selectedPlan.name}.`);
      return;
    }

    if (amt > balance) {
      setError("Insufficient balance. Please deposit funds to your account first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id, amount: amt }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Something went wrong."); return; }

      setBalance(data.newBalance);
      setShowSuccess(true);
      setAmount("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSelectedPlan(PLANS[0]);
    setAmount("");
  };

  const amt = parseFloat(amount) || 0;
  // Daily return = amount × (profit% / 100)
  // Total return = (daily return × duration) + principal
  const dailyProfit = amt > 0 ? (amt * selectedPlan.profit / 100).toFixed(2) : "0.00";
  const totalReturn = amt > 0 ? ((amt * selectedPlan.profit / 100 * selectedPlan.duration) + amt).toFixed(2) : "0.00";
  const quickAmts = quickAmounts(selectedPlan);

  return (
    <>
      {showSuccess && <SuccessModal planName={selectedPlan.name} onClose={handleSuccessClose} />}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Get started with your investment.</h1>
          <p className="text-white/40 text-sm mt-1">Choose a plan and invest from your account balance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">

              {/* Plan dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-white/50" />
                    <span className="font-semibold text-white">{selectedPlan.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedPlan.badge}`}>
                      {selectedPlan.profit}% daily
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-white/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1f35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20">
                    {PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/10 transition-colors text-left ${selectedPlan.id === plan.id ? "bg-white/10" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${plan.color}`} />
                          <span className="text-sm font-medium text-white">{plan.name}</span>
                          <span className="text-xs text-white/40">${plan.min.toLocaleString()} – ${plan.max.toLocaleString()}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${plan.badge}`}>{plan.profit}% daily</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick amounts */}
              <div>
                <p className="text-sm text-white/50 mb-3">Choose Quick Amount to Invest</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {quickAmts.map((qa) => (
                    <button
                      key={qa}
                      onClick={() => handleQuickAmount(qa)}
                      className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all ${
                        amount === String(qa)
                          ? `bg-gradient-to-r ${selectedPlan.color} border-transparent text-white`
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      ${qa.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual amount */}
              <div>
                <p className="text-sm text-white/50 mb-2">Or Enter Your Amount</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    min={selectedPlan.min}
                    max={selectedPlan.max}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <p className="text-xs text-white/30 mt-1.5">
                  Range: ${selectedPlan.min.toLocaleString()} – ${selectedPlan.max.toLocaleString()}
                </p>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-sm text-white/50 mb-2">Choose Payment Method</p>
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border bg-gradient-to-r ${selectedPlan.color} bg-opacity-10 ${selectedPlan.border}`}>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                  <span className="text-white font-semibold">Account Balance</span>
                  <span className="text-white/60 text-sm ml-auto">
                    ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm text-rose-400">
                  <AlertCircle size={14} className="flex-shrink-0" />{error}
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Investment Details ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${selectedPlan.color} px-5 py-4`}>
                <p className="text-sm font-bold text-white">Your Investment Details</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Plan name & price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Name of plan</p>
                    <p className="text-sm font-semibold text-white">{selectedPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Plan Range</p>
                    <p className="text-sm font-semibold text-white">${selectedPlan.min.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Duration & Profit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-white">{selectedPlan.duration} Days</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Daily Profit</p>
                    <p className="text-sm font-semibold text-emerald-400">{selectedPlan.profit}%</p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Min & Max */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Min Deposit</p>
                    <p className="text-sm font-semibold text-white">${selectedPlan.min.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Max Deposit</p>
                    <p className="text-sm font-semibold text-white">${selectedPlan.max.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Returns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Daily Profit</p>
                    <p className="text-sm font-semibold text-emerald-400">${dailyProfit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Total Profit ({selectedPlan.duration}d)</p>
                    <p className="text-sm font-semibold text-emerald-400">${Number(totalReturn).toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Payment method & amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Payment method</p>
                    <p className="text-sm font-semibold text-white">Account Balance</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Amount to Invest</p>
                    <p className="text-sm font-semibold text-white">${amt > 0 ? amt.toLocaleString() : "0"}</p>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  onClick={handleInvest}
                  disabled={submitting || !amount}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${selectedPlan.color} text-white font-bold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2`}
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    : "Confirm & Invest"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}