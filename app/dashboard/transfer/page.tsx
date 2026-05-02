"use client";

import { useState, useEffect } from "react";
import {
  SendHorizonal, Wallet, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";

function SuccessModal({
  amount, recipientName, onClose,
}: {
  amount: string; recipientName: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Transfer Successful!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          <span className="text-emerald-400 font-bold">${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>{" "}
          has been sent to{" "}
          <span className="text-white font-semibold">{recipientName}</span> successfully.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function TransferPage() {
  const [balance, setBalance] = useState(0);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ amount: string; recipientName: string } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(console.error);
  }, []);

  const handleProceed = async () => {
    setError("");

    if (!recipientEmail.trim()) {
      setError("Please enter the recipient's email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (amt > balance) {
      setError("Insufficient balance.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: recipientEmail.trim(), amount: amt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setBalance(data.newBalance);
      setSuccess({ amount, recipientName: data.recipientName });
      setRecipientEmail("");
      setAmount("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <SuccessModal
          amount={success.amount}
          recipientName={success.recipientName}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fund Transfer</h1>
          <p className="text-white/40 text-sm mt-1">
            Send funds instantly to another AverXchange account
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
          {/* Balance card */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-white/40">Your Account Balance</p>
            </div>
          </div>

          {/* Recipient email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Recipient Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => { setRecipientEmail(e.target.value); setError(""); }}
              placeholder="Enter recipient's email address"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
            />
            <p className="text-xs text-white/25">Only registered AverXchange email addresses</p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Amount ($) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="Enter amount you want to transfer"
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-white/30">
                Balance after transfer:{" "}
                <span className={parseFloat(amount) > balance ? "text-rose-400" : "text-emerald-400"}>
                  ${Math.max(0, balance - parseFloat(amount)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </p>
            )}
          </div>

          {/* Transfer charges */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/[0.06]">
            <span className="text-sm text-white/50">Transfer Charges</span>
            <span className="text-sm font-bold text-emerald-400">0%</span>
          </div>

          {/* Error */}
          {error && (
            <p className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </p>
          )}

          {/* Proceed button */}
          <button
            onClick={handleProceed}
            disabled={loading || !recipientEmail || !amount}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
              : <><SendHorizonal size={18} /> Proceed</>
            }
          </button>
        </div>
      </div>
    </>
  );
}