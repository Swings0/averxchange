"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const router = useRouter();
  const year = new Date().getFullYear();

  const showMsg = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const newErrors: Record<string, boolean> = {};
    ["email", "password"].forEach((f) => { if (!data[f] || String(data[f]).trim() === "") newErrors[f] = true; });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showMsg("Please fill in all fields", "error");
      setTimeout(() => setErrors({}), 5000);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        showMsg(result.error || "Invalid credentials", "error");
      } else {
        showMsg("Welcome back!", "success");
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch {
      showMsg("Server error", "error");
    }
    setLoading(false);
  };

  const fieldClass = (name: string) =>
    `w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-1 transition text-sm ${
      errors[name] ? "border-rose-500 focus:ring-rose-500" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/30"
    }`;

  return (
    <section className="relative min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(99,102,241,0.06),transparent_50%)]" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full text-sm border backdrop-blur-md shadow-lg ${
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
          <Image src="/Aver_logo1.png" alt="Logo" width={72} height={72} className="bg-white p-1.5 rounded-2xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-8">
            Sign in to your account to continue managing your investments.
          </p>
          <div className="relative w-56 h-56">
            <Image src="/SignUp1.png" alt="Login" fill className="rounded-full object-cover opacity-80" sizes="224px" loading="eager" />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 w-full max-w-xs text-left">
            {[["Your funds are safe", "Bank-level security & encryption"], ["Real-time tracking", "Monitor your portfolio 24/7"], ["Instant support", "Our team is always here"]].map(([title, sub]) => (
              <div key={title} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/40">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 lg:p-8 flex flex-col gap-4 justify-center">
          <div className="lg:hidden flex justify-center mb-2">
            <Image src="/Aver_logo1.png" alt="Logo" width={56} height={56} className="bg-white p-1 rounded-2xl" />
          </div>
          <div className="mb-2">
            <h1 className="text-xl font-bold text-white">Sign In</h1>
            <p className="text-white/40 text-xs mt-0.5">Enter your credentials to access your account</p>
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input name="email" type="email" placeholder="Email Address" className={fieldClass("email")} />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? "text-rose-400" : "text-white/30 group-focus-within:text-cyan-400"}`} />
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" className={`${fieldClass("password")} pr-10`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="flex justify-end -mt-2">
            <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-xs text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">Create one</Link>
          </p>
          <p className="text-center text-[11px] text-white/20">© {year} AverXchange. All Rights Reserved.</p>
        </form>
      </div>
    </section>
  );
}