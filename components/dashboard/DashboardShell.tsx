"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

interface DashboardShellProps {
  children: React.ReactNode;
  displayName: string;
  balance: number;
}

export default function DashboardShell({
  children,
  displayName,
  balance,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Intentionally does NOT use ConstellationBackground — dashboard has its own bg
    <div className="min-h-screen bg-[#080f1a] flex overflow-hidden">
      <Sidebar
        displayName={displayName}
        balance={balance}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <TopBar
          displayName={displayName}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}