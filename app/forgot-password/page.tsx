"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [modal, setModal] = useState("");
  const [focused, setFocused] = useState(false);

  const handle = async () => {
    if (!email.trim()) {
      setEmailError(true);
      setModal("Please enter your email address");
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

    setTimeout(() => setMsg(""), 15000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030d10] flex items-center justify-center relative overflow-hidden px-4">

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glows */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(8,145,178,0.09) 0%, transparent 70%)" }}
      />

      {/* Toast */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out
          bg-red-500/10 border border-red-500/40 text-red-300 px-5 py-2.5 rounded-full text-sm backdrop-blur-md whitespace-nowrap
          ${modal ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        {modal}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)" }}
        />

        <div className="bg-white/[0.03] border border-cyan-500/[0.15] rounded-2xl px-8 py-9 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">

          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h1 className="text-[1.35rem] font-bold text-cyan-50 tracking-tight mb-1.5">
            Reset your password
          </h1>
          <p className="text-[13px] text-cyan-200/40 leading-relaxed mb-7 font-light">
            Enter your email and we'll send you a link to get back in.
          </p>

          {/* Label */}
          <span className="block text-[10.5px] font-semibold uppercase tracking-widest text-cyan-500/60 mb-2">
            Email address
          </span>

          {/* Input */}
          <div className={`relative mb-4 transition-all duration-200 ${focused ? "drop-shadow-[0_0_12px_rgba(6,182,212,0.15)]" : ""}`}>
            <svg
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${focused ? "text-cyan-400" : "text-cyan-800"}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-cyan-100 bg-cyan-500/[0.05] outline-none placeholder:text-cyan-900 border transition-all duration-200 caret-cyan-400
                ${emailError
                  ? "border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.07)]"
                  : focused
                    ? "border-cyan-500/50 bg-cyan-500/[0.08] shadow-[0_0_0_3px_rgba(6,182,212,0.08)]"
                    : "border-cyan-500/[0.12] hover:border-cyan-500/25"
                }`}
            />
          </div>

          {/* Button */}
          <button
            disabled={loading}
            onClick={handle}
            className={`w-full py-3 rounded-xl text-sm font-semibold text-white relative overflow-hidden transition-all duration-200
              bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-700
              shadow-[0_4px_24px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
              ${loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(6,182,212,0.4)] active:translate-y-0 cursor-pointer"
              }`}
          >
            <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <span className="relative flex items-center justify-center gap-2">
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                  <path className="opacity-80" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? "Sending link…" : "Send Reset Link"}
            </span>
          </button>

          {/* Response message */}
          {msg && (
            <div className="mt-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-cyan-200/70 text-[13px] leading-relaxed animate-[fadeUp_0.3s_ease]">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {msg}
            </div>
          )}

          {/* Back link */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-cyan-500/[0.08]" />
            <button className="text-[12px] text-cyan-700 hover:text-cyan-400 transition-colors duration-150 cursor-pointer bg-transparent border-none">
              ← Back to sign in
            </button>
            <div className="flex-1 h-px bg-cyan-500/[0.08]" />
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}




// "use client";

// import { useState } from "react";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [emailError, setEmailError] = useState(false);
//   const [modal, setModal] = useState("");

//   const handle = async () => {
//     // ❌ VALIDATION
//     if (!email.trim()) {
//       setEmailError(true);
//       setModal("Enter email");

//       setTimeout(() => {
//         setModal("");
//         setEmailError(false);
//       }, 3000);

//       return;
//     }

//     setLoading(true);

//     const res = await fetch("/api/forgot-password", {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     });

//     const data = await res.json();

//     const message = data.message || data.error;
//     setMsg(message);

//     // ⏱️ 15 seconds message timeout
//     setTimeout(() => {
//       setMsg("");
//     }, 15000);

//     setLoading(false);
//   };

//   return (
//     <div className="h-screen flex items-center justify-center text-white gap-2 relative">

//       {/* MODAL */}
//       {modal && (
//         <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-400 text-white px-6 py-2 rounded-full text-sm backdrop-blur-md">
//           {modal}
//         </div>
//       )}

//       <div className="bg-white/5 p-6 rounded-md">
//         <input
//           placeholder="Enter email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className={`mb-4 p-2 bg-white/10 border transition
//             ${emailError ? "border-red-500" : "border-transparent"}
//           `}
//         />

//         <button
//           disabled={loading}
//           className={`cursor-pointer bg-linear-to-r from-cyan-300 to-cyan-900 ml-2 p-2 transform transition duration-300
//             hover:scale-105
//             ${loading ? "opacity-50 cursor-not-allowed" : ""}
//           `}
//           onClick={handle}
//         >
//           {loading ? "Sending..." : "Send Reset Link"}
//         </button>

//         <p className="mt-2 text-sm text-white/80">{msg}</p>
//       </div>
//     </div>
//   );
// }