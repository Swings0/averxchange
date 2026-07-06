"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SignInResult = {
  error?: string;
  ok?: boolean;
  status?: number;
  url?: string | null;
};

export default function LoginPage() {
  const router = useRouter(); // ✅ FIXED (THIS WAS MISSING)

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const year = new Date().getFullYear();

  const showMsg = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "").trim();

    const newErrors: Record<string, boolean> = {};
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showMsg("Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    try {
      const res = (await signIn("credentials", {
        email,
        password,
        redirect: false,
      })) as SignInResult;

      if (!res || res.error) {
        showMsg("Invalid email or password", "error");
        setLoading(false);
        return;
      }

      showMsg("Welcome!", "success");

      // ✅ FIXED REDIRECT FLOW
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 500);

    } catch (err) {
      console.error(err);
      showMsg("Server error", "error");
    }

    setLoading(false);
  };

  const fieldClass = (name: string) =>
    `w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-1 transition text-sm ${
      errors[name]
        ? "border-rose-500 focus:ring-rose-500"
        : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/30"
    }`;

  return (
    <section className="relative min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(99,102,241,0.06),transparent_50%)]" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full text-sm border backdrop-blur-md shadow-lg ${
            toast.type === "error"
              ? "bg-rose-500/20 border-rose-400/50 text-rose-200"
              : "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-cyan-900/30 to-indigo-900/20 p-10 text-center border-r border-white/[0.06]">
          <Image
            src="/Aver_logo1.png"
            alt="Logo"
            width={72}
            height={72}
            className="bg-white p-1.5 rounded-2xl mb-6"
          />

          <h2 className="text-2xl font-bold">Welcome Back!</h2>

          <p className="text-white/50 text-sm max-w-xs mt-2 mb-8">
            Sign in to manage your investments and portfolio.
          </p>

          <Image
            src="/SignUp1.png"
            alt="Login"
            width={220}
            height={220}
            className="opacity-80 rounded-full"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="p-6 lg:p-8 flex flex-col gap-4 justify-center"
        >
          <div className="lg:hidden flex justify-center mb-2">
            <Image
              src="/Aver_logo1.png"
              alt="Logo"
              width={56}
              height={56}
              className="bg-white p-1 rounded-2xl"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold">Sign In</h1>
            <p className="text-white/40 text-xs">
              Enter your credentials to continue
            </p>
          </div>

          {/* Email */}
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className={fieldClass("email")}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`${fieldClass("password")} pr-10`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-cyan-400">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold rounded-xl disabled:opacity-60"
          >
            {loading ? "Signing in..." : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-400">
              Create one
            </Link>
          </p>

          <p className="text-center text-[11px] text-white/20">
            © {year} AverXchange
          </p>
        </form>
      </div>
    </section>
  );
}