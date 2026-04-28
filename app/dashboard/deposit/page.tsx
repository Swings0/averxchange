"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  CheckCircle2,
  Upload,
  ArrowRight,
  X,
  History,
  ChevronLeft,
  Loader2,
} from "lucide-react";

// ─── Wallet config ────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: "bitcoin",
    label: "Bitcoin",
    symbol: "BTC",
    address: "bc1qdlu8m0f8az68gwar37skp2umtgdn8xtfadstjh",
    network: "Bitcoin Network",
    color: "from-orange-500/20 to-amber-600/20",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
    icon: "₿",
  },
  {
    id: "eth",
    label: "Ethereum",
    symbol: "ETH",
    address: "0x7746F6c6d64300C1A9623cf2EaEA5f13a196bbEC",
    network: "ERC20",
    color: "from-indigo-500/20 to-blue-600/20",
    border: "border-indigo-500/30",
    dot: "bg-indigo-400",
    icon: "Ξ",
  },
  {
    id: "sol",
    label: "Solana",
    symbol: "SOL",
    address: "FpyhvTyUXBWXWbPqdwbT5RfwATirun19DeLTg9XcJ2XD",
    network: "Solana Network",
    color: "from-purple-500/20 to-violet-600/20",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
    icon: "◎",
  },
  {
    id: "usdt-trc20",
    label: "USDT TRC20",
    symbol: "USDT",
    address: "TNquwEWUeickLmZX2jkyzBSytZBmdsndxF",
    network: "TRC20",
    color: "from-teal-500/20 to-emerald-600/20",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
    icon: "₮",
  },
  {
    id: "usdt-erc20",
    label: "USDT ERC20",
    symbol: "USDT",
    address: "0x8cb0c9fD23CB8Eb9ef833cA5C4DEA296D0d9a130",
    network: "ERC20",
    color: "from-cyan-500/20 to-sky-600/20",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
    icon: "₮",
  },
];

// ─── Success Modal ────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Done!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          Be patient while we process your payment. You'll receive a confirmation email shortly.
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
export default function DepositPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState(PAYMENT_METHODS[0]);
  const [copied, setCopied] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selected.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    setError("");
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 100) {
      setError("Minimum deposit is $100");
      return;
    }
    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProof(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proof) {
      setError("Please upload proof of payment.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("amount", amount);
      fd.append("paymentMethod", selected.label);
      fd.append("walletAddress", selected.address);
      fd.append("proof", proof);

      const res = await fetch("/api/deposit", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setShowSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setStep(1);
    setAmount("");
    setProof(null);
    setProofPreview(null);
    setSelected(PAYMENT_METHODS[0]);
  };

  return (
    <>
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Fund Your Account
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Add funds using any payment method below
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30 uppercase tracking-wider">Current Balance</p>
            <p className="text-lg font-bold text-white">$0.00</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Main Form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1 */}
            {step === 1 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
                {/* Amount input */}
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-2">
                    Enter Deposit Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      min="5"
                      step="0.01"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(""); }}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-1.5">Minimum deposit: $100</p>
                  {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
                </div>

                {/* Payment method selection */}
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelected(method)}
                        className={`
                          flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left
                          transition-all duration-200
                          bg-gradient-to-r ${method.color}
                          ${selected.id === method.id
                            ? `${method.border} ring-1 ring-offset-0`
                            : "border-white/[0.06] hover:border-white/20"
                          }
                        `}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0 bg-white/10`}
                        >
                          {method.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {method.label}
                          </p>
                          <p className="text-xs text-white/40">{method.network}</p>
                        </div>
                        {selected.id === method.id && (
                          <Check size={15} className="text-cyan-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proceed button */}
                <button
                  onClick={handleProceed}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20"
                >
                  Proceed to Payment
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
                {/* Back button */}
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>

                {/* Payment method badge */}
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Your payment method
                  </span>
                  <span className="text-white font-semibold">{selected.label}</span>
                  <span className={`w-2 h-2 rounded-full ${selected.dot}`} />
                </div>

                {/* Payment instruction */}
                <div className={`rounded-xl bg-gradient-to-r ${selected.color} border ${selected.border} p-5`}>
                  <p className="text-white/70 text-sm mb-1">You are to make a payment of</p>
                  <p className="text-2xl font-bold text-white mb-1">${parseFloat(amount).toFixed(2)}</p>
                  <p className="text-white/40 text-xs">using {selected.label} ({selected.network})</p>
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selected.color} border ${selected.border} flex items-center justify-center text-4xl font-bold text-white`}>
                    {selected.icon}
                  </div>
                </div>

                {/* Wallet address */}
                <div>
                  <p className="text-sm font-medium text-white/70 mb-2">
                    {selected.label} Address:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white/60 truncate">
                      {selected.address}
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all flex-shrink-0 ${
                        copied
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-white/10 text-white border-white/10 hover:bg-white/15"
                      }`}
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                  <p className="text-xs text-white/30 mt-1.5">
                    Network Type: <span className="text-white/50">{selected.network}</span>
                  </p>
                </div>

                {/* Proof upload */}
                <div>
                  <p className="text-sm font-medium text-white/70 mb-2">
                    Upload Payment Proof
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        className="w-full max-h-48 object-cover"
                      />
                      <button
                        onClick={() => { setProof(null); setProofPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <div className="px-4 py-2 bg-black/30 text-xs text-white/50 truncate">
                        {proof?.name}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/10 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-white/20 hover:bg-white/5 transition-all"
                    >
                      <Upload size={22} className="text-white/30" />
                      <span className="text-sm text-white/40">Click to upload payment proof</span>
                      <span className="text-xs text-white/25">PNG, JPG, PDF accepted</span>
                    </button>
                  )}

                  {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !proof}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Submit Payment
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Stats sidebar ── */}
          <div className="space-y-4">
            {/* Deposit stats */}
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                <p className="text-sm font-bold text-white">Deposit Statistics</p>
                <Download size={18} className="text-white/70" />
              </div>
              <div className="bg-white/[0.03] p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Total Deposited</p>
                    <p className="text-xl font-bold text-white">$0.00</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">💵</span>
                  </div>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Minimum Deposit</p>
                    <p className="text-xl font-bold text-white">$100</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Download size={18} className="text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* View history */}
            <Link
              href="/dashboard/transactions"
              className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
            >
              <History size={18} className="text-white/40 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                View Deposit History
              </span>
            </Link>

            {/* Need help */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center">
              <div className="text-2xl mb-2">🎧</div>
              <p className="text-sm font-semibold text-white mb-1">Need Help?</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Contact our support team for assistance with deposits
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}