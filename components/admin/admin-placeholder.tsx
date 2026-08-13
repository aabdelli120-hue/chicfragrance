import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-chic-muted">{description}</p>
      <div className="card mt-6 p-5 text-sm text-chic-muted">
        Module console prêt — branchement données avancé à venir.
      </div>
    </AdminShell>
  );
}
