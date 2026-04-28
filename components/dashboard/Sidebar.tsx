"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Download,
  Upload,
  ArrowLeftRight,
  User,
  TrendingUp,
  Users,
  Wallet,
  X,
  ChevronRight,
  LogOut,
  Coins,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",           href: "/dashboard",                icon: Home },
  { label: "Deposit",        href: "/dashboard/deposit",        icon: Download },
  { label: "Withdrawal",     href: "/dashboard/withdrawal",     icon: Upload },
  { label: "Transactions",   href: "/dashboard/transactions",   icon: ArrowLeftRight },
  { label: "Profile",        href: "/dashboard/profile",        icon: User },
  { label: "Trading Plans",   href: "/dashboard/purchase-plan",   icon: TrendingUp },
  { label: "My Plans",        href: "/dashboard/my-plans",        icon: BookOpen },
  { label: "Referrals",      href: "/dashboard/referrals",      icon: Users },
];

interface SidebarProps {
  displayName: string;
  balance: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  displayName,
  balance,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-[#0b1524] border-r border-white/[0.06]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
        `}
      >
        {/* Header — logo + user */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center">
              <User size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight truncate max-w-[110px]">
                {displayName}
              </p>
              <span className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/40">online</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl px-4 py-3">
            <Coins size={18} className="text-cyan-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Balance</p>
              <p className="text-sm font-bold text-white">
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30"
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                  }
                `}
              >
                <Icon
                  size={17}
                  className={
                    active
                      ? "text-cyan-400"
                      : "text-white/30 group-hover:text-white/60"
                  }
                />
                <span className="flex-1">{label}</span>
                {active && (
                  <ChevronRight size={13} className="text-cyan-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Support card */}
        <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-[#0f2744] to-[#091a30] border border-white/[0.06] p-4">
          <p className="text-sm font-bold text-white mb-1">Need Help?</p>
          <p className="text-xs text-white/40 mb-3 leading-relaxed">
            Contact our 24/7 customer support center
          </p>
          <Link
            href="/dashboard/support"
            className="block text-center bg-white text-[#080f1a] text-xs font-bold py-2 rounded-xl hover:bg-white/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {/* Logout */}
        <div className="px-3 pb-5">
          <Link
            href="/api/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}




