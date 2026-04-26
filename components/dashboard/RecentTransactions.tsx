import Link from "next/link";
import { ArrowLeftRight, ExternalLink } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
  failed:    "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white/70 uppercase tracking-widest">
          Recent Transactions{" "}
          <span className="text-white/30 normal-case font-normal tracking-normal">
            ({transactions.length})
          </span>
        </h2>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1.5 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors"
        >
          <ExternalLink size={12} />
          View all
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="text-[11px] text-white/30 uppercase tracking-wider">Date</span>
          <span className="text-[11px] text-white/30 uppercase tracking-wider text-center">Type</span>
          <span className="text-[11px] text-white/30 uppercase tracking-wider text-right">Amount</span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <ArrowLeftRight size={28} className="text-white/10" />
            <p className="text-white/25 text-sm">No record yet</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-3 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors items-center"
            >
              <span className="text-sm text-white/40">
                {new Date(tx.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <div className="flex justify-center">
                <span
                  className={`text-xs border px-2.5 py-0.5 rounded-full capitalize ${
                    STATUS_STYLES[tx.status] ?? STATUS_STYLES.pending
                  }`}
                >
                  {tx.type}
                </span>
              </div>
              <span
                className={`text-sm font-semibold text-right ${
                  tx.type === "withdrawal" ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {tx.type === "withdrawal" ? "−" : "+"}$
                {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}