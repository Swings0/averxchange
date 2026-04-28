"use client";

import { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, User, AtSign, Mail, Phone, Globe, Lock, Gift, ArrowRight } from "lucide-react";
import { getNames } from "country-list";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const countries = getNames().sort();

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [referralId, setReferralId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = new Date().getFullYear();

  // Auto-fill referral from URL ?ref=CODE
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralId(ref);
  }, [searchParams]);

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.referralId = referralId; // inject referral

    const required = ["fullName", "username", "email", "phone", "country", "password"];
    const newErrors: Record<string, boolean> = {};
    required.forEach((f) => { if (!data[f] || String(data[f]).trim() === "") newErrors[f] = true; });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill in all required fields", "error");
      setTimeout(() => setErrors({}), 5000);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || "Something went wrong", "error");
      } else {
        showToast("Account created! Redirecting...", "success");
        form.reset();
        setTimeout(() => router.push("/login"), 1200);
      }
    } catch {
      showToast("Server error", "error");
    }
    setLoading(false);
  };

  const field = (name: string) => ({
    error: !!errors[name],
    className: `w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-1 transition text-sm ${
      errors[name] ? "border-rose-500 focus:ring-rose-500" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/30"
    }`,
  });

  return (
    <section className="relative min-h-screen bg-[#020617] flex items-center justify-center px-4 py-10 text-white overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(99,102,241,0.06),transparent_50%)]" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full text-sm border backdrop-blur-md shadow-lg transition-all ${
          toast.type === "error"
            ? "bg-rose-500/20 border-rose-400/50 text-rose-200"
            : "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-cyan-900/30 to-indigo-900/20 p-10 text-center border-r border-white/[0.06]">
          <div className="mb-6">
            <Image src="/Aver_logo1.png" alt="Logo" width={64} height={64} className="bg-white p-1 rounded-2xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Start Your Journey</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Join thousands of investors earning daily returns on AverXchange.
            </p>
          </div>
          <div className="relative w-56 h-56">
            <Image src="/SignUp1.png" alt="Signup" fill className="rounded-full object-cover opacity-80" sizes="224px" loading="eager" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs text-left">
            {[["$5 Referral Bonus", "Earn per invite"], ["Daily Returns", "Up to 15.5%"], ["Secure Platform", "256-bit encrypted"], ["24/7 Support", "Always available"]].map(([title, sub]) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs font-semibold text-white">{title}</p>
                <p className="text-xs text-white/40">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 lg:p-8 flex flex-col gap-3">
          <div className="lg:hidden flex justify-center mb-2">
            <Image src="/Aver_logo1.png" alt="Logo" width={56} height={56} className="bg-white p-1 rounded-2xl" />
          </div>
          <div className="mb-1">
            <h1 className="text-xl font-bold text-white">Create Account</h1>
            <p className="text-white/40 text-xs mt-0.5">Fill in your details to get started</p>
          </div>

          {/* Full Name */}
          <div className="relative group">
            <User size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.fullName ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input name="fullName" placeholder="Full Name" className={field("fullName").className} />
          </div>

          {/* Username */}
          <div className="relative group">
            <AtSign size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.username ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input name="username" placeholder="Username" className={field("username").className} />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input type="email" name="email" placeholder="Email Address" className={field("email").className} />
          </div>

          {/* Phone */}
          <div className="relative group">
            <Phone size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input name="phone" placeholder="Phone Number" className={field("phone").className} />
          </div>

          {/* Country */}
          <div className="relative group">
            <Globe size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.country ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <select name="country" defaultValue="" className={`${field("country").className} appearance-none`}>
              <option value="" disabled className="text-black">Select Country</option>
              {countries.map((c) => <option key={c} value={c} className="text-black">{c}</option>)}
            </select>
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" className={`${field("password").className} pr-10`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Referral — auto-filled from URL */}
          <div className="relative group">
            <Gift size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
            <input
              placeholder="Referral ID (optional)"
              value={referralId}
              onChange={(e) => setReferralId(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-xs text-white/40 mt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Login</Link>
          </p>
          <p className="text-center text-[11px] text-white/20">© {year} AverXchange. All Rights Reserved.</p>
        </form>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}