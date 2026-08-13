"use client";

import Image from "next/image";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast-provider";
import { WorkspaceProvider, useOptionalWorkspace } from "@/lib/platform/workspace-context";

export function AppShell({
  children,
  orderCount,
}: {
  children: React.ReactNode;
  orderCount: number;
}) {
  return (
    <WorkspaceProvider>
      <ToastProvider>
        <ShellInner orderCount={orderCount}>{children}</ShellInner>
      </ToastProvider>
    </WorkspaceProvider>
  );
}

function ShellInner({
  children,
  orderCount,
}: {
  children: React.ReactNode;
  orderCount: number;
}) {
  const [open, setOpen] = useState(false);
  const workspace = useOptionalWorkspace();
  const orgName = workspace?.session?.organization?.name || "Workspace";
  const logoSrc = workspace?.session?.organization?.logoUrl || "/logo.png";

  return (
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
                src={logoSrc}
                alt={orgName}
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
  );
}
