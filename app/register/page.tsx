"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  AtSign,
  Mail,
  Phone,
  Globe,
  Lock,
  Gift,
} from "lucide-react";
import { getNames } from "country-list";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const countries = getNames().sort();

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const year = new Date().getFullYear();

  // ✅ TOAST STATE
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  // ✅ ERROR STATE
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // ✅ TOAST HANDLER
  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 7000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // ✅ REQUIRED FIELDS ONLY (REFERRAL EXCLUDED)
    const requiredFields = [
      "fullName",
      "username",
      "email",
      "phone",
      "country",
      "password",
    ];

    const newErrors: Record<string, boolean> = {};

    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        newErrors[field] = true;
      }
    });

    setErrors(newErrors);

    // ❌ STOP IF ERRORS
    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill in all required fields", "error");

      setTimeout(() => {
        setErrors({});
      }, 7000);

      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || "Something went wrong", "error");
      } else {
        showToast("Welcome!", "success");
        form.reset();
        // ✅ REDIRECT AFTER SUCCESS
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }

    setLoading(false);
  };

  // ✅ INPUT STYLE (dynamic error support)
  const inputStyle = (field: string) =>
    `w-full pl-10 pr-3 py-2 rounded-md bg-white/10 border text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition text-sm
    ${
      errors[field] ? "border-red-500" : "border-white/20"
    }`;

  return (
    <section className="relative min-h-screen bg-[#020617]/30 flex items-center justify-center px-4 text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.06),transparent_25%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,150,255,0.05),transparent_25%)]" />

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-8 py-2 rounded-full text-sm shadow-lg backdrop-blur-md border transition-all duration-300 mt-6
            ${
              toast.type === "error"
                ? "bg-red-500/20 border-red-400 text-white/90"
                : "bg-cyan-500/20 border-cyan-400 text-white/90"
            }`}
        >
          {toast.message}
        </div>
      )}

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-md overflow-hidden shadow-xl">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-cyan-900/30 p-8 text-center">
          <h2 className="mb-2 bg-clip-text text-transparent bg-linear-to-r from-white to-cyan-500 text-3xl font-bold">
            Let Get You Started!
          </h2>

          <p className="text-white/80 text-sm max-w-xs">
            Start your investment journey with a secure and profitable platform.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="relative w-55 h-55 lg:w-65 lg:h-65">
              <Image
                src="/SignUp1.png"
                alt="Signup"
                fill
                className="rounded-full object-cover shadow-2xl opacity-80"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate className="lg:p-6 flex flex-col gap-2 p-5">

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

          {/* FULL NAME */}
          <div className="relative group">
            <User
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.fullName
                  ? "text-red-500"
                  : "text-white/50 group-focus-within:text-cyan-400"
              }`}
            />
            <input
              name="fullName"
              placeholder="Full Name"
              required
              className={inputStyle("fullName")}
            />
          </div>

          {/* USERNAME */}
          <div className="relative group">
            <AtSign
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.username
                  ? "text-red-500"
                  : "text-white/50 group-focus-within:text-cyan-400"
              }`}
            />
            <input
              name="username"
              placeholder="Username"
              required
              className={inputStyle("username")}
            />
          </div>

          {/* EMAIL */}
          <div className="relative group">
            <Mail
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.email
                  ? "text-red-500"
                  : "text-white/50 group-focus-within:text-cyan-400"
              }`}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className={inputStyle("email")}
            />
          </div>

          {/* PHONE */}
          <div className="relative group">
            <Phone
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.phone
                  ? "text-red-500"
                  : "text-white/50 group-focus-within:text-cyan-400"
              }`}
            />
            <input
              name="phone"
              placeholder="Phone"
              required
              className={inputStyle("phone")}
            />
          </div>

          {/* COUNTRY */}
          <div className="relative group">
            <Globe
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.country
                  ? "text-red-500"
                  : "text-white/50 group-focus-within:text-cyan-400"
              }`}
            />
            <select
              name="country"
              required
              defaultValue=""
              className={inputStyle("country")}
            >
              <option value="" disabled className="text-black">
                Select Country
              </option>

              {countries.map((country) => (
                <option key={country} value={country} className="text-black">
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.password
                  ? "text-red-500"
                  : "text-white/50 group-focus-within:text-cyan-400"
              }`}
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              className={`${inputStyle("password")} pr-10`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-400 transition"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* REFERRAL (NOT REQUIRED) */}
          <div className="relative group">
            <Gift size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-cyan-400 transition-colors" />
            <input
              name="referralId"
              placeholder="Referral ID (optional)"
              className={inputStyle("referralId")}
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="mt-1 py-2 border border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition-all duration-300 text-sm"
          >
            {loading ? "Creating..." : "Register"}
          </button>

           <div className="text-xs tracking-wider flex flex-col items-center mt-2 gap-4 ">
             <p className="text-white/70 font-light">Already have an account? <Link href="/login" className="text-cyan-400 hover:underline text-sm font-manrope">Login</Link></p>
             <p className="text-xs text-white/50 font-extralight tracking-tight ">© Copyright {year}   averexchange Trades   All Rights Reserved.</p>
         </div>
        </form>
      </div>
    </section>
  );
}