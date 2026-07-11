"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

const CATEGORIES = ["Alimentação", "Medição", "Receitas", "Bem-estar"];

export default function NovoArtigoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    body: "",
    category: "Bem-estar",
    readMinutes: 3,
    published: true,
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/articles", form);
      router.push("/conteudo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/conteudo" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Novo artigo</h1>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <Field label="Título">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Categoria">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Resumo (excerpt)">
          <input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Opcional — gerado automaticamente se vazio"
          />
        </Field>
        <Field label="Conteúdo (markdown simples: **negrito**, listas com -)">
          <textarea
            required
            rows={14}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm font-mono resize-y"
          />
        </Field>
        <div className="flex gap-4">
          <Field label="Minutos de leitura">
            <input
              type="number"
              min={1}
              value={form.readMinutes}
              onChange={(e) => setForm({ ...form, readMinutes: Number(e.target.value) })}
              className="w-24 rounded-xl border px-3 py-2 text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicar agora
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Criar artigo"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
