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
          <div className="sticky top-0 z-20 border-b border-chic-line/80 bg-[#F7F8F5]/95 backdrop-blur lg:hidden">
            <div className="relative flex h-16 items-center px-4">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="z-10 rounded-full border border-chic-line bg-white px-3.5 py-2 text-xs font-semibold text-chic-forest-deep shadow-sm"
              >
                Menu
              </button>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Chic Fragrance"
                  width={280}
                  height={100}
                  className="h-auto w-[124px] object-contain"
                  priority
                />
              </div>
              <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-chic-line bg-white text-xs font-semibold text-chic-forest-deep">
                S
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
