"use client";

import Image from "next/image";
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
          <div className="relative flex h-16 items-center px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="z-10 rounded-full bg-chic-forest px-3.5 py-2 text-xs font-medium text-white shadow-sm"
            >
              Menu
            </button>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-[158px] overflow-hidden rounded-lg bg-chic-forest">
                <Image
                  src="/logo.png"
                  alt="Chic Fragrance depuis 1999"
                  width={512}
                  height={320}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
