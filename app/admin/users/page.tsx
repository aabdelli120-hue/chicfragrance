"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      organizationName: string;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/admin?view=users")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setUsers(data.users);
      });
  }, []);

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Users</h1>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-chic-line text-xs text-chic-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-chic-line/70">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.organizationName}</td>
                <td className="px-4 py-3">{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
