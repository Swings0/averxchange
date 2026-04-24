"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [modal, setModal] = useState("");

  const handle = async () => {
    // ❌ VALIDATION
    if (!email.trim()) {
      setEmailError(true);
      setModal("Enter email");

      setTimeout(() => {
        setModal("");
        setEmailError(false);
      }, 3000);

      return;
    }

    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    const message = data.message || data.error;
    setMsg(message);

    // ⏱️ 15 seconds message timeout
    setTimeout(() => {
      setMsg("");
    }, 15000);

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center text-white gap-2 relative">

      {/* MODAL */}
      {modal && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-400 text-white px-6 py-2 rounded-full text-sm backdrop-blur-md">
          {modal}
        </div>
      )}

      <div className="bg-white/5 p-6 rounded-md">
        <input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mb-4 p-2 bg-white/10 border transition
            ${emailError ? "border-red-500" : "border-transparent"}
          `}
        />

        <button
          disabled={loading}
          className={`cursor-pointer bg-linear-to-r from-cyan-300 to-cyan-900 ml-2 p-2 transform transition duration-300
            hover:scale-105
            ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={handle}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="mt-2 text-sm text-white/80">{msg}</p>
      </div>
    </div>
  );
}