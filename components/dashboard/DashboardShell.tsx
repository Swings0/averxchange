"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

interface DashboardShellProps {
  children: React.ReactNode;
  displayName: string;
  balance: number;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Open sidebar by default on desktop
    setSidebarOpen(window.innerWidth >= 1024);

    // Fetch user info client-side — no server DB calls in layout
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.displayName) setDisplayName(d.displayName);
        if (typeof d.balance === "number") setBalance(d.balance);
      })
      .catch(console.error);
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="min-h-screen bg-[#080f1a] flex overflow-hidden">
      <Sidebar
        displayName={displayName}
        balance={balance}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <TopBar displayName={displayName} onMenuToggle={toggleSidebar} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}