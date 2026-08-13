"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import type { LandingPage, LandingPageSection } from "@/lib/platform/types";

export default function LandingPageEditorRoute() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8 lg:py-8">
        <LandingEditor />
      </main>
    </AppShell>
  );
}

function LandingEditor() {
  const params = useParams<{ id: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/landing-pages/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setPage(data.page);
        else setError(data.error || "Introuvable");
      });
  }, [params.id]);

  async function persist(next: LandingPage) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/landing-pages/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: next.content,
        theme: next.theme,
        name: next.name,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Enregistrement impossible.");
      return;
    }
    setPage(data.page);
  }

  async function publish() {
    const res = await fetch(`/api/landing-pages/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Publication impossible.");
      return;
    }
    setPage(data.page);
  }

  function updateSection(sectionId: string, patch: Partial<LandingPageSection>) {
    if (!page) return;
    const sections = page.content.sections.map((s) =>
      s.id === sectionId
        ? { ...s, ...patch, content: { ...s.content, ...(patch.content || {}) } }
        : s,
    );
    setPage({ ...page, content: { sections } });
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    if (!page) return;
    const sections = [...page.content.sections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex((s) => s.id === sectionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sections.length) return;
    const copy = [...sections];
    const tmp = copy[index];
    copy[index] = copy[target];
    copy[target] = tmp;
    setPage({
      ...page,
      content: { sections: copy.map((s, i) => ({ ...s, order: i })) },
    });
  }

  if (!page) {
    return <p className="text-sm text-chic-muted">{error || "Chargement…"}</p>;
  }

  const sections = [...page.content.sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/app/landing-pages" className="text-sm text-chic-emerald hover:underline">
            ← Landing Pages
          </Link>
          <h1 className="mt-2 font-serif text-3xl">{page.name}</h1>
          <p className="text-sm text-chic-muted">
            {page.status} · /{page.slug}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreview("desktop")}
            className={`rounded-xl border px-3 py-1.5 text-xs ${preview === "desktop" ? "border-chic-emerald bg-chic-mint" : "border-chic-line"}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreview("mobile")}
            className={`rounded-xl border px-3 py-1.5 text-xs ${preview === "mobile" ? "border-chic-emerald bg-chic-mint" : "border-chic-line"}`}
          >
            Mobile
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void persist(page)}
            className="rounded-xl border border-chic-line px-3 py-1.5 text-xs font-medium"
          >
            {saving ? "…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            className="rounded-xl bg-chic-forest px-3 py-1.5 text-xs font-semibold text-white"
          >
            Publier
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium capitalize">{section.type}</p>
                <label className="flex items-center gap-1 text-xs text-chic-muted">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={(e) =>
                      updateSection(section.id, { visible: e.target.checked })
                    }
                  />
                  Visible
                </label>
              </div>
              {typeof section.content.headline === "string" ||
              typeof section.content.title === "string" ? (
                <input
                  className="mt-2 w-full rounded-lg border border-chic-line px-2 py-1.5 text-sm"
                  value={String(section.content.headline || section.content.title || "")}
                  onChange={(e) =>
                    updateSection(section.id, {
                      content: {
                        ...(section.content.headline !== undefined
                          ? { headline: e.target.value }
                          : { title: e.target.value }),
                      },
                    })
                  }
                />
              ) : null}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="text-xs text-chic-muted"
                  onClick={() => moveSection(section.id, -1)}
                >
                  Monter
                </button>
                <button
                  type="button"
                  className="text-xs text-chic-muted"
                  onClick={() => moveSection(section.id, 1)}
                >
                  Descendre
                </button>
              </div>
            </div>
          ))}
        </aside>

        <div
          className={`mx-auto w-full rounded-[28px] border border-chic-line bg-white p-6 shadow-sm ${
            preview === "mobile" ? "max-w-[390px]" : "max-w-3xl"
          }`}
          style={{ background: page.theme.backgroundColor }}
        >
          {sections
            .filter((s) => s.visible)
            .map((section) => (
              <section key={section.id} className="border-b border-black/5 py-8 last:border-0">
                <p className="text-[10px] tracking-[0.16em] text-chic-muted">
                  {section.type.toUpperCase()}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-chic-forest-deep">
                  {String(
                    section.content.headline || section.content.title || section.type,
                  )}
                </h2>
                {section.content.subheadline ||
                section.content.description ||
                section.content.text ? (
                  <p className="mt-2 text-sm text-chic-muted">
                    {String(
                      section.content.subheadline ||
                        section.content.description ||
                        section.content.text ||
                        "",
                    )}
                  </p>
                ) : null}
                {section.content.cta || section.content.button ? (
                  <button
                    type="button"
                    className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: page.theme.primaryColor }}
                  >
                    {String(section.content.cta || section.content.button)}
                  </button>
                ) : null}
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
