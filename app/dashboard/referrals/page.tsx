"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, User, Gift } from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralBonus: number;
  referredBy: { name: string } | null;
  referrals: {
    id: string; name: string; email: string;
    status: string; joinedAt: string;
  }[];
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    fetch("/api/referrals").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  const referralLink = data ? `${baseUrl}/register?ref=${data.referralCode}` : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Referrals</h1>
        <p className="text-white/40 text-sm mt-1">Refer users to AverXchange community and earn $5 per referral</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Referrals</p>
            <p className="text-2xl font-bold text-white">{data?.referrals.length ?? 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Users size={20} className="text-cyan-400" />
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Referral Bonus Earned</p>
            <p className="text-2xl font-bold text-white">${data?.referralBonus?.toFixed(2) ?? "0.00"}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Gift size={20} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Referral link */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
        <p className="text-sm text-white/60 text-center">You can refer users by sharing your referral link:</p>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 font-mono truncate">
            {referralLink || "Loading..."}
          </div>
          <button
            onClick={handleCopy}
            disabled={!referralLink}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Referral ID */}
        <div className="text-center space-y-1">
          <p className="text-xs text-white/40">or your Referral ID</p>
          <p className="text-lg font-bold text-cyan-400">{data?.referralCode || "—"}</p>
        </div>

        {/* Referred by */}
        <div className="text-center space-y-2 pt-2 border-t border-white/[0.06]">
          <p className="text-sm text-white/50">You were referred by</p>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <User size={18} className="text-white/40" />
            </div>
            <p className="text-sm font-medium text-white/60">
              {data?.referredBy ? data.referredBy.name : "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Referrals table */}
      <div>
        <h2 className="text-base font-semibold text-white/70 uppercase tracking-widest mb-4">
          Your Referrals <span className="text-white/30 normal-case font-normal tracking-normal">({data?.referrals.length ?? 0})</span>
        </h2>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            {["Client Name", "Status", "Bonus Earned", "Date Registered"].map((h) => (
              <span key={h} className="text-[11px] text-white/30 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {!data || data.referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Users size={28} className="text-white/10" />
              <p className="text-white/25 text-sm">No referrals yet</p>
            </div>
          ) : (
            data.referrals.map((r) => (
              <div key={r.id} className="grid grid-cols-4 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors items-center">
                <div>
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <p className="text-xs text-white/30">{r.email}</p>
                </div>
                <span className={`text-xs border px-2.5 py-0.5 rounded-full w-fit capitalize ${
                  r.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}>
                  {r.status}
                </span>
                <span className="text-sm font-semibold text-emerald-400">$5.00</span>
                <span className="text-sm text-white/40">
                  {new Date(r.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}