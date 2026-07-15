"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDateBR } from "@/lib/utils";
import type { Announcement } from "@/types";

const KIND_LABELS: Record<Announcement["kind"], string> = {
  feature: "Novidade",
  campaign: "Campanha",
  info: "Aviso",
};

const AUDIENCE_LABELS: Record<Announcement["audience"], string> = {
  all: "Todas",
  free: "Gratuitas",
  premium: "Premium",
};

export default function NovidadesAdminPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<Announcement[]>("/admin/announcements")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (item: Announcement) => {
    await api.patch(`/admin/announcements/${item._id}`, { active: !item.active });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta novidade?")) return;
    await api.delete(`/admin/announcements/${id}`);
    load();
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novidades & campanhas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aparecem no app na primeira vez. Ao fechar, a usuária não vê de novo.
          </p>
        </div>
        <Link
          href="/novidades/nova"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nova
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center rounded-2xl border border-dashed border-gray-200 bg-white">
          Nenhuma novidade ainda. Crie a primeira para avisar as mamães no app.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item._id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-brand-600">
                      {KIND_LABELS[item.kind]}
                    </span>
                    <span className="text-[10px] font-medium rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                      {AUDIENCE_LABELS[item.audience]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {item.active ? "Ativa" : "Inativa"}
                    </span>
                    {item.priority > 0 && (
                      <span className="text-[10px] text-gray-400">prioridade {item.priority}</span>
                    )}
                  </div>
                  <h2 className="mt-1 font-bold text-gray-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.body}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    Criada em {formatDateBR(item.createdAt)}
                    {item.ctaHref ? ` · CTA: ${item.ctaLabel || "Ver"} → ${item.ctaHref}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={`/novidades/${item._id}`}
                    className="text-xs font-semibold text-gray-600 hover:text-brand-600"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => toggleActive(item)}
                    className="text-xs font-semibold text-gray-600 hover:text-brand-600 text-left"
                  >
                    {item.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    className="inline-flex items-center gap-1 text-xs text-red-500"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
