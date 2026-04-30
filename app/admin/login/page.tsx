"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Invalid credentials");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Server error. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(6,182,212,0.06),transparent_60%)]" />

      <div className="relative w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
          <Shield size={26} className="text-cyan-400" />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">Admin Portal</h1>
        <p className="text-white/40 text-sm text-center mb-8">Restricted access — authorized personnel only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative group">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
            <input
              name="username"
              placeholder="Admin Username"
              required
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition text-sm"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type={showPw ? "text" : "password"}
              name="password"
              placeholder="Admin Password"
              required
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition text-sm"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p className="text-rose-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            {loading ? "Authenticating..." : <><span>Access Dashboard</span><ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}