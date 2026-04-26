"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Settings, Shield, Eye, EyeOff,
  ArrowRight, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface UserData {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  withdrawalSettings?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    swiftCode?: string;
    bitcoinAddress?: string;
    ethereumAddress?: string;
    usdtTrc20Address?: string;
    usdtErc20Address?: string;
    solanaAddress?: string;
  };
}

// ─── Top Loading Bar ──────────────────────────────────────────────
function TopLoader({ status }: { status: "idle" | "loading" | "done" | "error" }) {
  if (status === "idle") return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`h-1 transition-all duration-500 ${
        status === "loading" ? "w-3/4 bg-cyan-500 animate-pulse" :
        status === "done"    ? "w-full bg-emerald-500" :
                               "w-full bg-rose-500"
      }`} />
      {status !== "loading" && (
        <div className={`flex items-center gap-2 px-4 py-2 text-xs font-medium ${
          status === "done" ? "bg-emerald-500/20 text-emerald-400 border-b border-emerald-500/30" :
                              "bg-rose-500/20 text-rose-400 border-b border-rose-500/30"
        }`}>
          {status === "done"
            ? <><CheckCircle2 size={13} /> Done!</>
            : <><AlertCircle size={13} /> Update failed</>
          }
        </div>
      )}
    </div>
  );
}

// ─── Field Component ─────────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder, readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`
          w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white
          placeholder-white/20 transition-all focus:outline-none
          ${readOnly
            ? "border-white/5 opacity-60 cursor-not-allowed"
            : "border-white/10 focus:border-cyan-500/50 focus:bg-white/8"
          }
        `}
      />
    </div>
  );
}

// ─── Password Field ───────────────────────────────────────────────
function PasswordField({
  label, value, onChange, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/40 uppercase tracking-wider">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────
const TABS = [
  { id: "personal",    label: "Personal Settings",    icon: User },
  { id: "withdrawal",  label: "Withdrawal Settings",  icon: Settings },
  { id: "password",    label: "Password / Security",  icon: Shield },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Main Page ────────────────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [loaderStatus, setLoaderStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [userData, setUserData] = useState<UserData>({});

  // Fetch user on mount
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setUserData(data))
      .catch(console.error);
  }, []);

  const showLoader = (status: "done" | "error") => {
    setLoaderStatus(status);
    setTimeout(() => setLoaderStatus("idle"), 2500);
  };

  // ── Personal fields state ──
  const [personal, setPersonal] = useState({
    fullName: "", username: "", phone: "", dateOfBirth: "", country: "",
  });

  // Sync personal fields when userData loads
  useEffect(() => {
    setPersonal({
      fullName:    userData.fullName    ?? "",
      username:    userData.username    ?? "",
      phone:       userData.phone       ?? "",
      dateOfBirth: userData.dateOfBirth ?? "",
      country:     userData.country     ?? "",
    });
  }, [userData]);

  const handlePersonalUpdate = async () => {
    setLoaderStatus("loading");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personal),
      });
      const data = await res.json();
      if (!res.ok) { showLoader("error"); return; }
      setUserData(data.user);
      showLoader("done");
    } catch {
      showLoader("error");
    }
  };

  // ── Withdrawal fields state ──
  const [ws, setWs] = useState({
    bankName: "", accountName: "", accountNumber: "", swiftCode: "",
    bitcoinAddress: "", ethereumAddress: "",
    usdtTrc20Address: "", usdtErc20Address: "", solanaAddress: "",
  });

  useEffect(() => {
    const w = userData.withdrawalSettings ?? {};
    setWs({
      bankName:         w.bankName         ?? "",
      accountName:      w.accountName      ?? "",
      accountNumber:    w.accountNumber    ?? "",
      swiftCode:        w.swiftCode        ?? "",
      bitcoinAddress:   w.bitcoinAddress   ?? "",
      ethereumAddress:  w.ethereumAddress  ?? "",
      usdtTrc20Address: w.usdtTrc20Address ?? "",
      usdtErc20Address: w.usdtErc20Address ?? "",
      solanaAddress:    w.solanaAddress    ?? "",
    });
  }, [userData]);

  const handleWithdrawalUpdate = async () => {
    setLoaderStatus("loading");
    try {
      const res = await fetch("/api/profile/withdrawal-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ws),
      });
      const data = await res.json();
      if (!res.ok) { showLoader("error"); return; }
      setUserData(data.user);
      showLoader("done");
    } catch {
      showLoader("error");
    }
  };

  // ── Password state ──
  const [pw, setPw] = useState({ old: "", new: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const handlePasswordUpdate = async () => {
    setPwError("");
    if (!pw.old || !pw.new || !pw.confirm) { setPwError("All fields are required."); return; }
    if (pw.new.length < 5) { setPwError("Password must be at least 5 characters."); return; }
    if (pw.new !== pw.confirm) { setPwError("Passwords do not match."); return; }

    setLoaderStatus("loading");
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pw.old, newPassword: pw.new, confirmPassword: pw.confirm }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "Update failed."); showLoader("error"); return; }
      setPw({ old: "", new: "", confirm: "" });
      showLoader("done");
    } catch {
      showLoader("error");
    }
  };

  return (
    <>
      <TopLoader status={loaderStatus} />

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-white/40 text-sm mt-1">Manage your profile and security settings</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === id
                  ? "bg-[#0d1b2a] text-white shadow-sm border border-white/10"
                  : "text-white/40 hover:text-white/70"
                }
              `}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Personal Settings ── */}
        {activeTab === "personal" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={personal.fullName}
                onChange={(v) => setPersonal((p) => ({ ...p, fullName: v }))}
                placeholder="Your full name"
              />
              <Field
                label="Email Address"
                value={userData.email ?? ""}
                readOnly
              />
              <Field
                label="Phone Number"
                value={personal.phone}
                onChange={(v) => setPersonal((p) => ({ ...p, phone: v }))}
                placeholder="Your phone number"
                type="tel"
              />
              <Field
                label="Date of Birth"
                value={personal.dateOfBirth}
                onChange={(v) => setPersonal((p) => ({ ...p, dateOfBirth: v }))}
                type="date"
              />
              <Field
                label="Country"
                value={personal.country}
                onChange={(v) => setPersonal((p) => ({ ...p, country: v }))}
                placeholder="Your country"
              />
              <Field
                label="Username"
                value={personal.username}
                onChange={(v) => setPersonal((p) => ({ ...p, username: v }))}
                placeholder="Your username"
              />
            </div>

            <button
              onClick={handlePersonalUpdate}
              disabled={loaderStatus === "loading"}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              {loaderStatus === "loading"
                ? <><Loader2 size={16} className="animate-spin" /> Updating...</>
                : "Update Profile"
              }
            </button>
          </div>
        )}

        {/* ── Tab: Withdrawal Settings ── */}
        {activeTab === "withdrawal" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
            {/* Bank details */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Bank Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bank Name" value={ws.bankName} onChange={(v) => setWs((s) => ({ ...s, bankName: v }))} placeholder="Enter bank name" />
                <Field label="Account Name" value={ws.accountName} onChange={(v) => setWs((s) => ({ ...s, accountName: v }))} placeholder="Enter account name" />
                <Field label="Account Number" value={ws.accountNumber} onChange={(v) => setWs((s) => ({ ...s, accountNumber: v }))} placeholder="Enter account number" />
                <Field label="Swift Code" value={ws.swiftCode} onChange={(v) => setWs((s) => ({ ...s, swiftCode: v }))} placeholder="Enter swift code" />
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Crypto addresses */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Crypto Withdrawal Addresses</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Field label="Bitcoin Address" value={ws.bitcoinAddress} onChange={(v) => setWs((s) => ({ ...s, bitcoinAddress: v }))} placeholder="Enter Bitcoin address" />
                  <p className="text-xs text-white/25">Used to withdraw your Bitcoin funds</p>
                </div>
                <div className="space-y-1.5">
                  <Field label="Ethereum Address" value={ws.ethereumAddress} onChange={(v) => setWs((s) => ({ ...s, ethereumAddress: v }))} placeholder="Enter Ethereum address" />
                  <p className="text-xs text-white/25">Used to withdraw your Ethereum funds</p>
                </div>
                <div className="space-y-1.5">
                  <Field label="Solana Address" value={ws.solanaAddress} onChange={(v) => setWs((s) => ({ ...s, solanaAddress: v }))} placeholder="Enter Solana address" />
                  <p className="text-xs text-white/25">Used to withdraw your Solana funds</p>
                </div>
                <div className="space-y-1.5">
                  <Field label="USDT TRC20 Address" value={ws.usdtTrc20Address} onChange={(v) => setWs((s) => ({ ...s, usdtTrc20Address: v }))} placeholder="Enter USDT TRC20 address" />
                  <p className="text-xs text-white/25">Used to withdraw your USDT TRC20 funds</p>
                </div>
                <div className="space-y-1.5">
                  <Field label="USDT ERC20 Address" value={ws.usdtErc20Address} onChange={(v) => setWs((s) => ({ ...s, usdtErc20Address: v }))} placeholder="Enter USDT ERC20 address" />
                  <p className="text-xs text-white/25">Used to withdraw your USDT ERC20 funds</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleWithdrawalUpdate}
              disabled={loaderStatus === "loading"}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              {loaderStatus === "loading"
                ? <><Loader2 size={16} className="animate-spin" /> Updating...</>
                : "Update Withdrawal Settings"
              }
            </button>
          </div>
        )}

        {/* ── Tab: Password / Security ── */}
        {activeTab === "password" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordField label="Old Password" value={pw.old} onChange={(v) => setPw((p) => ({ ...p, old: v }))} required />
              <PasswordField label="New Password" value={pw.new} onChange={(v) => setPw((p) => ({ ...p, new: v }))} required />
              <PasswordField label="Confirm New Password" value={pw.confirm} onChange={(v) => setPw((p) => ({ ...p, confirm: v }))} required />
            </div>

            {pwError && (
              <p className="flex items-center gap-2 text-sm text-rose-400">
                <AlertCircle size={14} /> {pwError}
              </p>
            )}

            <button
              onClick={handlePasswordUpdate}
              disabled={loaderStatus === "loading"}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              {loaderStatus === "loading"
                ? <><Loader2 size={16} className="animate-spin" /> Updating...</>
                : "Update Password"
              }
            </button>

            <div className="h-px bg-white/[0.06]" />

            <Link
              href="/dashboard/security"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Advanced Account Settings
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}