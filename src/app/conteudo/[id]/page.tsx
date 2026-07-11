"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Article } from "@/types";

const CATEGORIES = ["Alimentação", "Medição", "Receitas", "Bem-estar"];

export default function EditarArtigoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Partial<Article>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<Article[]>("/admin/articles")
      .then(({ data }) => {
        const article = data.find((a) => a._id === id);
        if (article) setForm(article);
        else router.push("/conteudo");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/articles/${id}`, {
        title: form.title,
        excerpt: form.excerpt,
        body: form.body,
        category: form.category,
        readMinutes: form.readMinutes,
        published: form.published,
      });
      router.push("/conteudo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/conteudo" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Editar artigo</h1>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-gray-500">Título</label>
          <input
            required
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Slug (URL)</label>
          <p className="mt-1 text-sm text-gray-400 font-mono">/dicas/{form.slug}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Categoria</label>
          <select
            value={form.category ?? "Bem-estar"}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Resumo</label>
          <input
            value={form.excerpt ?? ""}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Conteúdo</label>
          <textarea
            required
            rows={14}
            value={form.body ?? ""}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono resize-y"
          />
        </div>
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-gray-500">Min. leitura</label>
            <input
              type="number"
              min={1}
              value={form.readMinutes ?? 3}
              onChange={(e) => setForm({ ...form, readMinutes: Number(e.target.value) })}
              className="mt-1 w-24 rounded-xl border px-3 py-2 text-sm block"
            />
          </div>
          <label className="flex items-center gap-2 text-sm mt-4">
            <input
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicado
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
