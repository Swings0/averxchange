"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Monitor, Trash2, AlertTriangle, X, Loader2, LogOut } from "lucide-react";

function DeleteModal({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={26} className="text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white text-center mb-2">
          Are you sure?
        </h2>
        <p className="text-white/50 text-sm text-center leading-relaxed mb-6">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogOutOthers = async () => {
    // For now this just logs out fully — full session tracking can be added later
    setLoggingOut(true);
    try {
      await fetch("/api/logout");
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        router.push("/login");
      }
    } catch {
      setDeleting(false);
    }
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          loading={deleting}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security / Account
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage your sessions and account data
          </p>
        </div>

        {/* Browser Sessions */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Monitor size={17} className="text-cyan-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Browser Sessions</h2>
          </div>

          <p className="text-sm text-white/50 leading-relaxed">
            Manage and log out your active sessions on other browsers and devices.
          </p>
          <p className="text-sm text-white/40 leading-relaxed">
            If necessary, you may log out of all your other browser sessions across all devices.
            Some of your recent sessions are listed below; however, this list may not be exhaustive.
            If you feel your account has been compromised, you should also update your password.
          </p>

          {/* Current session */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Monitor size={15} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Current Session</p>
              <p className="text-xs text-white/40">This device — Active now</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <button
            onClick={handleLogOutOthers}
            disabled={loggingOut}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            {loggingOut
              ? <Loader2 size={15} className="animate-spin" />
              : <LogOut size={15} />
            }
            Log Out Other Browser Sessions
          </button>
        </div>

        {/* Delete Account */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <Trash2 size={17} className="text-rose-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Delete Account</h2>
          </div>

          <p className="text-sm font-medium text-white/70">
            Permanently delete your account
          </p>
          <p className="text-sm text-white/40 leading-relaxed">
            Once your account is deleted, all of its resources and data will be permanently lost.
            Please make sure you have withdrawn any remaining balance before proceeding.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all text-sm font-semibold"
          >
            <Trash2 size={15} />
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}