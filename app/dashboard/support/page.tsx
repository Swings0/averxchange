"use client";

import { useState } from "react";
import {
  MessageSquare, Mail, Send, CheckCircle2,
  AlertCircle, Loader2, ChevronDown, HeadphonesIcon,
  Clock, Shield, Zap,
} from "lucide-react";

const CATEGORIES = [
  "General Inquiry",
  "Deposit Issue",
  "Withdrawal Issue",
  "Account Problem",
  "Investment Plan",
  "Transfer Issue",
  "Security Concern",
  "Other",
];

export default function SupportPage() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError("");
    if (!category) { setError("Please select a category."); return; }
    if (!subject.trim()) { setError("Please enter a subject."); return; }
    if (!message.trim() || message.trim().length < 10) {
      setError("Please enter a detailed message (at least 10 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Message Sent!</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            Your support request has been received. Our team will get back to you within 24 hours.
          </p>
          <p className="text-white/30 text-xs mb-8">A confirmation has been sent to your email.</p>
          <button
            onClick={() => { setSent(false); setCategory(""); setSubject(""); setMessage(""); }}
            className="px-8 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">24/7 Customer Support</h1>
        <p className="text-white/40 text-sm mt-1">We&apos;re here to help — send us a message anytime</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
              <HeadphonesIcon size={22} className="text-cyan-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">AverXchange Support</h2>
            <p className="text-xs text-white/40 leading-relaxed mb-3">
              For inquiries, suggestions or complaints
            </p>
            <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <Mail size={13} className="text-cyan-400 flex-shrink-0" />
              <span className="text-xs font-mono text-cyan-400 break-all">
                support@averexchange.com
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
            {[
              { icon: Clock,  label: "Response Time", value: "Within 24 hours",    color: "text-amber-400",  bg: "bg-amber-500/20 border-amber-500/30"   },
              { icon: Shield, label: "Secure",         value: "Encrypted & private", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
              { icon: Zap,    label: "Available",      value: "24/7 Support",       color: "text-violet-400",  bg: "bg-violet-500/20 border-violet-500/30"  },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="text-sm font-medium text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-5">

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">
                Category <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => setCategoryOpen((v) => !v)}
                  className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm hover:border-white/20 transition"
                >
                  <span className={category ? "text-white" : "text-white/30"}>
                    {category || "Select a category"}
                  </span>
                  <ChevronDown size={16} className={`text-white/40 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
                </button>
                {categoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f1f35] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setCategory(cat); setCategoryOpen(false); setError(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition ${
                          category === cat ? "text-cyan-400 bg-white/5" : "text-white/70"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">
                Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setError(""); }}
                placeholder="Brief summary of your issue"
                maxLength={100}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <MessageSquare size={14} />
                Message <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setError(""); }}
                  placeholder="Describe your issue in detail. Include any relevant transaction IDs, dates, or amounts that may help us assist you faster..."
                  rows={7}
                  maxLength={2000}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition resize-none leading-relaxed"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-white/20">
                  {message.length}/2000
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </p>
            )}

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Sending...</>
                : <><Send size={17} /> Send Message</>
              }
            </button>

            <p className="text-center text-xs text-white/25">
              A confirmation will be sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}