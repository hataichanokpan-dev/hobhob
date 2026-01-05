"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <AppHeader onMenuClick={handleMenuClick} />
      <main className="flex-1 pt-2">
        {children}
      </main>
      <AppFooter />
      <AppSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </div>
  );
}
