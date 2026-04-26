"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const year = new Date().getFullYear();

  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const showMsg = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const required = ["email", "password"];
    const newErrors: Record<string, boolean> = {};

    required.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        newErrors[field] = true;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showMsg("Please fill in all fields", "error");
      setTimeout(() => setErrors({}), 7000);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showMsg(result.error || "Invalid credentials", "error");
      } else {
        showMsg("Login successful", "success");

        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch {
      showMsg("Server error", "error");
    }

    setLoading(false);
  };

  const inputStyle = (field: string) =>
    `w-full pl-9 pr-3 py-2 rounded-md bg-white/10 border text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition text-sm
    ${errors[field] ? "border-red-500" : "border-white/20"}`;

  return (
    <section className="relative min-h-screen bg-[#020617]/30 flex items-center justify-center px-4 text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.06),transparent_25%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,150,255,0.05),transparent_25%)]" />

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-sm border backdrop-blur-md z-50
          ${
            toast.type === "error"
              ? "bg-red-500/20 border-red-400 text-white"
              : "bg-cyan-500/20 border-cyan-400 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* MAIN CARD (SAME STRUCTURE AS REGISTER) */}
      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-md overflow-hidden shadow-xl">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-cyan-900/30 p-8 text-center">
          <h2 className="mb-2 bg-clip-text text-transparent bg-linear-to-r from-white to-cyan-500 text-3xl font-bold">
            Welcome Back!
          </h2>

          <p className="text-white/80 text-sm max-w-xs">
            To keep you connected, please login with your personal info.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="relative w-55 h-55 lg:w-65 lg:h-65">
              <Image
                src="/SignUp1.png"
                alt="login"
                fill
                className="rounded-full object-cover shadow-2xl opacity-80"
                loading="eager"
                sizes="(max-width: 1024px) 0px, 260px"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <form onSubmit={handleLogin} className="lg:p-6 flex flex-col gap-4 p-5">

          {/* LOGO */}
          <div className="w-full flex justify-center mb-2">
            <Image
              src="/Aver_logo1.png"
              alt="Logo"
              width={80}
              height={80}
              className="bg-white p-1 rounded-full"
            />
          </div>

          {/* EMAIL */}
          <div className="relative">
            <Mail
              className={`absolute left-3 top-3 ${
                errors.email ? "text-red-500" : "text-white/50"
              }`}
              size={16}
            />
            <input
              name="email"
              placeholder="Email"
              className={inputStyle("email")}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock
              className={`absolute left-3 top-3 ${
                errors.password ? "text-red-500" : "text-white/50"
              }`}
              size={16}
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={inputStyle("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white/60 hover:text-cyan-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* BUTTON */}
          <button className="py-2 border border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition">
            {loading ? "Logging in..." : "Login"}
          </button>

          <Link
            href="/forgot-password"
            className="text-xs text-center text-cyan-400 hover:underline"
          >
            Forgot Password?
          </Link>

         <div className="text-xs tracking-wider flex flex-col items-center mt-2 gap-4 ">
             <p className="text-white/70 font-light">Don't have an account?<Link href="/register" className="text-cyan-400 hover:underline text-sm font-manrope">Sign Up</Link></p>
             <p className="text-xs text-white/50 font-extralight tracking-tight ">© Copyright {year}   averexchange Trades   All Rights Reserved.</p>
         </div>
        </form>
      </div>
    </section>
  );
}