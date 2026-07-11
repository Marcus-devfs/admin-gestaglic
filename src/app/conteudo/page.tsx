"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDateBR } from "@/lib/utils";
import type { Article } from "@/types";

const LP_URL = process.env.NEXT_PUBLIC_LP_URL || "https://gestaglic.com.br";

export default function ConteudoPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get<Article[]>("/admin/articles")
      .then(({ data }) => setArticles(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Remover este artigo?")) return;
    await api.delete(`/admin/articles/${id}`);
    load();
  };

  const togglePublish = async (article: Article) => {
    await api.patch(`/admin/articles/${article._id}`, {
      published: !article.published,
    });
    load();
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conteúdo / Dicas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Artigos publicados na LP ({LP_URL}/dicas) e no feed do app
          </p>
        </div>
        <Link
          href="/conteudo/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo artigo
        </Link>
      </div>

      <div className="space-y-3">
        {articles.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            Nenhum artigo. Rode o seed ou crie o primeiro.
          </p>
        ) : (
          articles.map((a) => (
            <div
              key={a._id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-brand-600">{a.category}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        a.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {a.published ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <h2 className="mt-1 font-bold text-gray-900">{a.title}</h2>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-1">{a.excerpt}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    /dicas/{a.slug} · {formatDateBR(a.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {a.published && (
                    <a
                      href={`${LP_URL}/dicas/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
                    >
                      Ver <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Link
                    href={`/conteudo/${a._id}`}
                    className="text-xs font-semibold text-gray-600 hover:text-brand-600"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => togglePublish(a)}
                    className="text-xs font-semibold text-gray-600 hover:text-brand-600 text-left"
                  >
                    {a.published ? "Despublicar" : "Publicar"}
                  </button>
                  <button
                    onClick={() => remove(a._id)}
                    className="inline-flex items-center gap-1 text-xs text-red-500"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
