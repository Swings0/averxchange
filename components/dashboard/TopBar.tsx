"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, User, ChevronDown, LogOut } from "lucide-react";

interface TopBarProps {
  displayName: string;
  onMenuToggle: () => void;
}

export default function TopBar({ displayName, onMenuToggle }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#0b1524]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Hamburger — visible only on mobile */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all lg:opacity-0 lg:pointer-events-none"
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Brand center */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-white/70 font-bold text-sm tracking-[0.2em] uppercase">
          AverXchange
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* User dropdown */}
        <div
          className="relative pl-3 border-l border-white/[0.08]"
          ref={dropdownRef}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-cyan-400" />
            </div>
            <span className="text-sm font-medium text-white/80 hidden sm:block max-w-[130px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={14}
              className={`text-white/40 hidden sm:block transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f1f35] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-xs text-white/40">Signed in as</p>
                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  {displayName}
                </p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <User size={15} />
                  Profile
                </Link>
                <Link
                  href="/api/logout"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
                  Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}