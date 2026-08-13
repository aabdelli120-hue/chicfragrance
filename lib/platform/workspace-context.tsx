"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Permission } from "@/lib/platform/permissions";
import type { AuthSession } from "@/lib/platform/types";

type WorkspaceContextValue = {
  loaded: boolean;
  session: AuthSession | null;
  refresh: () => Promise<void>;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  logout: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) {
      setSession(null);
      setLoaded(true);
      return;
    }
    const data = await res.json();
    setSession({
      user: data.user,
      organization: data.organization,
      permissions: data.permissions ?? [],
    });
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (cancelled) return;
      if (!res.ok) {
        setSession(null);
        setLoaded(true);
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      setSession({
        user: data.user,
        organization: data.organization,
        permissions: data.permissions ?? [],
      });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPermission = useCallback(
    (permission: Permission | Permission[]) => {
      if (!session) return false;
      const needed = Array.isArray(permission) ? permission : [permission];
      return needed.every((p) => session.permissions.includes(p));
    },
    [session],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ loaded, session, refresh, hasPermission, logout }),
    [loaded, session, refresh, hasPermission, logout],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}

export function useOptionalWorkspace() {
  return useContext(WorkspaceContext);
}
