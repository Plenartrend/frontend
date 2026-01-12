"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { WatchlistProvider } from "@/context/WatchlistContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <WatchlistProvider>
        <div className="h-full flex overflow-hidden">
          <Suspense fallback={null}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </Suspense>
          <div className="flex flex-1 flex-col overflow-hidden w-full">
            <Suspense fallback={null}>
              <Header onMenuClick={() => setSidebarOpen(true)} />
            </Suspense>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </WatchlistProvider>
    </AuthProvider>
  );
}
