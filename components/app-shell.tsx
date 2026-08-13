"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast-provider";

export function AppShell({
  children,
  orderCount,
}: {
  children: React.ReactNode;
  orderCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen lg:flex">
        <Sidebar orderCount={orderCount} open={open} onClose={() => setOpen(false)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl bg-chic-forest px-3 py-2 text-sm text-white"
            >
              Menu
            </button>
            <p className="font-serif text-lg">Chic Fragrance</p>
          </div>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
