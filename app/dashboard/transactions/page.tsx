"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Download, Upload, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  method: string;
  status: string;
  date: string;
}

const STATUS_STYLES: Record<string, string> = {
  approved:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
  declined:  "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 size={12} />,
  pending:  <Clock size={12} />,
  declined: <XCircle size={12} />,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const totalDeposited = transactions
    .filter((t) => t.type === "deposit" && t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);

  const pendingWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "pending")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-white/40 text-sm mt-1">Your complete transaction history</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Deposited</p>
            <p className="text-xl font-bold text-emerald-400">
              ${totalDeposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Download size={18} className="text-emerald-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Withdrawn</p>
            <p className="text-xl font-bold text-rose-400">
              ${totalWithdrawn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <Upload size={18} className="text-rose-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Pending Withdrawals</p>
            <p className="text-xl font-bold text-amber-400">
              ${pendingWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Clock size={18} className="text-amber-400" />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1.5 w-fit">
        {(["all", "deposit", "withdrawal"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-white/10 text-white border border-white/10"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {f === "all" ? "All" : f === "deposit" ? "Deposits" : "Withdrawals"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="col-span-2 text-[11px] text-white/30 uppercase tracking-wider">Date</span>
          <span className="col-span-3 text-[11px] text-white/30 uppercase tracking-wider">Type</span>
          <span className="col-span-3 text-[11px] text-white/30 uppercase tracking-wider">Method</span>
          <span className="col-span-2 text-[11px] text-white/30 uppercase tracking-wider text-right">Amount</span>
          <span className="col-span-2 text-[11px] text-white/30 uppercase tracking-wider text-right">Status</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ArrowLeftRight size={28} className="text-white/10" />
            <p className="text-white/25 text-sm">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-12 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors items-center"
            >
              {/* Date */}
              <div className="col-span-2">
                <p className="text-xs text-white/50">
                  {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <p className="text-[10px] text-white/25">
                  {new Date(tx.date).getFullYear()}
                </p>
              </div>

              {/* Type */}
              <div className="col-span-3 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.type === "deposit"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}>
                  {tx.type === "deposit" ? <Download size={13} /> : <Upload size={13} />}
                </div>
                <span className="text-sm text-white capitalize">{tx.type}</span>
              </div>

              {/* Method */}
              <div className="col-span-3">
                <p className="text-sm text-white/50 truncate">{tx.method || "—"}</p>
              </div>

              {/* Amount */}
              <div className="col-span-2 text-right">
                <span className={`text-sm font-semibold ${
                  tx.type === "deposit" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {tx.type === "deposit" ? "+" : "−"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-end">
                <span className={`flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full ${
                  STATUS_STYLES[tx.status] ?? STATUS_STYLES.pending
                }`}>
                  {STATUS_ICONS[tx.status]}
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}