"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // ❌ No token = redirect
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Something went wrong", "error");
      } else {
        showToast("Password updated successfully!", "success");

        setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }

    setLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#020617]/30 text-white px-4">

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full text-sm border backdrop-blur-md
            ${
              toast.type === "error"
                ? "bg-red-500/20 border-red-400"
                : "bg-cyan-500/20 border-cyan-400"
            }`}
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleReset}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-6 flex flex-col gap-4 shadow-xl"
      >
        <h2 className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-400">
          Reset Password
        </h2>

        <p className="text-center text-white/60 text-sm">
          Enter your new password below
        </p>

        {/* PASSWORD */}
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-cyan-400" size={16} />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition text-sm"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-400"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="mt-2 py-2 border border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition-all duration-300 text-sm"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}