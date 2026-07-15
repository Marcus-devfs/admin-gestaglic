"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Announcement, AnnouncementAudience, AnnouncementKind } from "@/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

const selectClass = cn(inputClass, "appearance-none pr-10");

function StyledSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
    </div>
  );
}

export default function EditarNovidadePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    body: "",
    kind: "feature" as AnnouncementKind,
    audience: "all" as AnnouncementAudience,
    ctaLabel: "",
    ctaHref: "",
    priority: 0,
    active: true,
  });

  useEffect(() => {
    api
      .get<Announcement[]>("/admin/announcements")
      .then(({ data }) => {
        const item = data.find((a) => a._id === id);
        if (!item) return;
        setForm({
          title: item.title,
          body: item.body,
          kind: item.kind,
          audience: item.audience,
          ctaLabel: item.ctaLabel || "",
          ctaHref: item.ctaHref || "",
          priority: item.priority || 0,
          active: item.active,
        });
      })
      .finally(() => setFetching(false));
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/admin/announcements/${id}`, {
        ...form,
        ctaLabel: form.ctaLabel || null,
        ctaHref: form.ctaHref || null,
      });
      router.push("/novidades");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/novidades"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Editar novidade</h1>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <Field label="Título">
          <input
            required
            maxLength={120}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Texto">
          <textarea
            required
            rows={5}
            maxLength={600}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className={inputClass + " resize-y"}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo">
            <StyledSelect
              value={form.kind}
              onChange={(value) => setForm({ ...form, kind: value as AnnouncementKind })}
            >
              <option value="feature">Novidade de produto</option>
              <option value="campaign">Campanha</option>
              <option value="info">Aviso</option>
            </StyledSelect>
          </Field>
          <Field label="Audiência">
            <StyledSelect
              value={form.audience}
              onChange={(value) => setForm({ ...form, audience: value as AnnouncementAudience })}
            >
              <option value="all">Todas as usuárias</option>
              <option value="free">Só gratuitas</option>
              <option value="premium">Só Premium</option>
            </StyledSelect>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão (opcional)">
            <input
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Link do botão (opcional)">
            <input
              value={form.ctaHref}
              onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Field label="Prioridade">
            <input
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Ativa
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
