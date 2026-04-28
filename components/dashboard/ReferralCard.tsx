"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users } from "lucide-react";

export default function ReferralCard() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((data) => {
        if (data.referralCode) setReferralCode(data.referralCode);
      })
      .catch(console.error);
  }, []);

  const link = referralCode ? `${baseUrl}/register?ref=${referralCode}` : "";

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section>
      <h2 className="text-base font-semibold text-white/70 uppercase tracking-widest mb-4">
        Refer Us &amp; Earn
      </h2>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Users size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Invite friends &amp; earn bonuses</p>
            <p className="text-xs text-white/40">Share your unique referral link below</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 truncate font-mono">
            {link || "Loading..."}
          </div>
          <button
            onClick={handleCopy}
            disabled={!link}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold
              transition-all duration-200 flex-shrink-0
              ${copied
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
              }
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {referralCode && (
          <p className="text-xs text-white/30 mt-2.5">
            Your referral ID:{" "}
            <span className="text-cyan-400 font-mono font-semibold">{referralCode}</span>
          </p>
        )}
      </div>
    </section>
  );
}