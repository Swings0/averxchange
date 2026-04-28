"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight, ChevronDown, ChevronUp, ChevronLeft,
  Loader2, CheckCircle2, AlertCircle, Clock, X,
} from "lucide-react";

const METHODS = [
  { id: "bitcoin",    label: "Bitcoin",     symbol: "BTC",  icon: "₿", wsKey: "bitcoinAddress",   min: 100, max: 100000, fee: 1, gradient: "from-orange-500 to-amber-600",  border: "border-orange-500/30",  accent: "text-orange-400"  },
  { id: "ethereum",   label: "Ethereum",    symbol: "ETH",  icon: "Ξ", wsKey: "ethereumAddress",  min: 100, max: 50000,  fee: 2, gradient: "from-indigo-500 to-blue-600",   border: "border-indigo-500/30",  accent: "text-indigo-400"  },
  { id: "solana",     label: "Solana",      symbol: "SOL",  icon: "◎", wsKey: "solanaAddress",    min: 100, max: 50000,  fee: 1, gradient: "from-purple-500 to-violet-600", border: "border-purple-500/30",  accent: "text-purple-400"  },
  { id: "usdt-trc20", label: "USDT TRC20",  symbol: "USDT", icon: "₮", wsKey: "usdtTrc20Address", min: 100, max: 100000, fee: 2, gradient: "from-teal-500 to-emerald-600",  border: "border-teal-500/30",   accent: "text-teal-400"    },
  { id: "usdt-erc20", label: "USDT ERC20",  symbol: "USDT", icon: "₮", wsKey: "usdtErc20Address", min: 100, max: 100000, fee: 2, gradient: "from-cyan-500 to-sky-600",      border: "border-cyan-500/30",   accent: "text-cyan-400"    },
] as const;

type Method = typeof METHODS[number];
type WSettings = Record<string, string>;

interface ActiveW {
  id: string; amount: number; method: string;
  walletAddress: string; status: string; createdAt: string;
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Request Submitted!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          Please be patient while we process your withdrawal. You will be notified once approved.
        </p>
        <button onClick={onClose} className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all">
          Got it
        </button>
      </div>
    </div>
  );
}

function TopLoader({ status }: { status: "idle" | "loading" | "done" | "error" }) {
  if (status === "idle") return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`h-1 transition-all duration-500 ${status === "loading" ? "w-3/4 bg-cyan-500 animate-pulse" : status === "done" ? "w-full bg-emerald-500" : "w-full bg-rose-500"}`} />
    </div>
  );
}

export default function WithdrawalPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<Method | null>(null);
  const [balance, setBalance] = useState(0);
  const [ws, setWs] = useState<WSettings>({});
  const [activeWs, setActiveWs] = useState<ActiveW[]>([]);
  const [showActive, setShowActive] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const [loaderStatus, setLoaderStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/withdrawal");
      const data = await res.json();
      setBalance(data.balance ?? 0);
      setWs(data.withdrawalSettings ?? {});
      setActiveWs(data.withdrawals ?? []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelect = (m: Method) => {
    setSelected(m);
    setWallet(ws[m.wsKey] ?? "");
    setAmount("");
    setError("");
    setStep(2);
  };

  const pendingTotal = (label: string) =>
    activeWs.filter((w) => w.method === label).reduce((s, w) => s + w.amount, 0);

  const handleSubmit = async () => {
    setError("");
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt)) { setError("Please enter an amount."); return; }
    if (amt < selected!.min) { setError(`Minimum is $${selected!.min}.`); return; }
    if (amt > selected!.max) { setError(`Maximum is $${selected!.max.toLocaleString()}.`); return; }
    if (amt > balance) { setError("Insufficient balance."); return; }
    if (!wallet.trim()) { setError("Please enter a wallet address."); return; }

    setLoaderStatus("loading");
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, method: selected!.label, walletAddress: wallet.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoaderStatus("error"); setTimeout(() => setLoaderStatus("idle"), 2500); return; }
      setLoaderStatus("done");
      setBalance(data.newBalance);
      await fetchData();
      setTimeout(() => { setLoaderStatus("idle"); setShowSuccess(true); }, 800);
    } catch {
      setError("Network error."); setLoaderStatus("error"); setTimeout(() => setLoaderStatus("idle"), 2500);
    }
  };

  const handleClose = () => { setShowSuccess(false); setStep(1); setSelected(null); setAmount(""); setWallet(""); };
  const savedWallet = selected ? (ws[selected.wsKey] ?? "") : "";

  return (
    <>
      <TopLoader status={loaderStatus} />
      {showSuccess && <SuccessModal onClose={handleClose} />}

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawal Methods</h1>
            <p className="text-white/40 text-sm mt-1">Choose your preferred withdrawal method</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30 uppercase tracking-wider">Available Balance</p>
            <p className="text-lg font-bold text-white">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Active Withdrawals accordion */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
          <button onClick={() => setShowActive((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Active Withdrawals</span>
              {activeWs.length > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">{activeWs.length} pending</span>
              )}
            </div>
            {showActive ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
          </button>

          {showActive && (
            <div className="px-5 pb-5 border-t border-white/[0.06]">
              {activeWs.length === 0 ? (
                <p className="text-sm text-white/30 py-6 text-center">No active withdrawals</p>
              ) : (
                <>
                  {/* Per-coin summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 mb-4">
                    {METHODS.map((m) => {
                      const p = pendingTotal(m.label);
                      if (!p) return null;
                      return (
                        <div key={m.id} className={`rounded-xl border ${m.border} bg-white/5 p-3`}>
                          <p className="text-xs text-white/40 mb-1">{m.label}</p>
                          <p className="text-sm font-bold text-white">${p.toFixed(2)}</p>
                          <span className="text-xs text-amber-400">pending</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* List */}
                  <div className="space-y-2">
                    {activeWs.map((w) => (
                      <div key={w.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/[0.06] px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{w.method}</p>
                          <p className="text-xs text-white/30 font-mono truncate max-w-[180px]">{w.walletAddress}</p>
                          <p className="text-xs text-white/20">{new Date(w.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-rose-400">−${w.amount.toFixed(2)}</p>
                          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* STEP 1 — Method cards */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {METHODS.map((m) => (
              <div key={m.id} className="rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/20 hover:scale-[1.01] transition-all duration-200">
                <div className={`bg-gradient-to-r ${m.gradient} p-5 flex items-center gap-4`}>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white">{m.icon}</div>
                  <div>
                    <p className="text-base font-bold text-white">{m.label}</p>
                    <p className="text-xs text-white/60">{m.symbol}</p>
                  </div>
                </div>
                <div className="bg-white/[0.03] p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/50"><ChevronDown size={14} className={m.accent} />Minimum</span>
                    <span className="font-semibold text-white">${m.min}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/50"><ChevronUp size={14} className={m.accent} />Maximum</span>
                    <span className="font-semibold text-white">${m.max.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-white/50"><ArrowUpRight size={14} className={m.accent} />Processing Fee</span>
                    <span className="font-semibold text-white">${m.fee}</span>
                  </div>
                  <button
                    onClick={() => handleSelect(m)}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${m.gradient} text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all mt-1`}
                  >
                    <ArrowUpRight size={16} /> Select This Method
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 — Details form */}
        {step === 2 && selected && (
          <div className="max-w-xl mx-auto">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
              <button onClick={() => { setStep(1); setError(""); }} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={16} /> Back to methods
              </button>

              <div className="flex items-center gap-3">
                <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">Your payment method</span>
                <span className="text-white font-semibold">{selected.label}</span>
              </div>

              <h2 className="text-xl font-bold text-white">Withdrawal Details</h2>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-sm text-white/50">Enter Amount to Withdraw ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(""); }}
                    placeholder="Enter Amount"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <p className="text-xs text-white/30">Min: ${selected.min} · Max: ${selected.max.toLocaleString()} · Fee: ${selected.fee}</p>
              </div>

              {/* Wallet address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Enter {selected.label} Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={wallet}
                    onChange={(e) => { setWallet(e.target.value); setError(""); }}
                    placeholder={`Enter ${selected.label} Address`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  {wallet && (
                    <button onClick={() => setWallet("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      <X size={15} />
                    </button>
                  )}
                </div>
                {/* Wallet hint */}
                {!savedWallet ? (
                  <p className="text-xs text-amber-400/80 flex items-start gap-1.5">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    No default {selected.label} address saved. Enter your wallet or save one in{" "}
                    <Link href="/dashboard/profile" className="underline hover:text-amber-400 ml-1">Profile → Withdrawal Settings</Link>.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-400/70">✓ Pre-filled from your saved profile. Clear to use a different address.</p>
                )}
              </div>

              {error && <p className="flex items-center gap-2 text-sm text-rose-400"><AlertCircle size={14} />{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loaderStatus === "loading"}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${selected.gradient} text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {loaderStatus === "loading"
                  ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  : <><ArrowUpRight size={18} /> Complete Request</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}