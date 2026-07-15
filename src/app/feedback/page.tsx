"use client";

import { useEffect, useState } from "react";
import { Check, Mail, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDateBR } from "@/lib/utils";
import type { FeedbackItem } from "@/types";

const STATUS_LABELS: Record<FeedbackItem["status"], string> = {
  open: "Novo",
  read: "Lido",
  resolved: "Resolvido",
};

const CATEGORY_LABELS: Record<FeedbackItem["category"], string> = {
  help: "Ajuda",
  feedback: "Sugestão",
  bug: "Problema",
};

export default function FeedbackAdminPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<"all" | FeedbackItem["status"]>("open");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const query = filter === "all" ? "" : `?status=${filter}`;
    api
      .get<FeedbackItem[]>(`/admin/feedback${query}`)
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id: string, status: FeedbackItem["status"]) => {
    await api.patch(`/admin/feedback/${id}`, { status });
    window.dispatchEvent(new Event("admin-feedback-changed"));
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback & ajuda</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mensagens enviadas pelas usuárias pelo app
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "open" as const, label: "Novos" },
          { key: "read" as const, label: "Lidos" },
          { key: "resolved" as const, label: "Resolvidos" },
          { key: "all" as const, label: "Todos" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium",
              filter === f.key ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhuma mensagem neste filtro.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const user =
              typeof item.userId === "object" && item.userId
                ? item.userId
                : { name: "—", email: "—" };

            return (
              <article
                key={item._id}
                className={cn(
                  "rounded-xl border bg-white p-4",
                  item.status === "open" ? "border-brand-200" : "border-gray-100"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold rounded-full px-2 py-0.5",
                          item.status === "open" && "bg-amber-100 text-amber-800",
                          item.status === "read" && "bg-blue-100 text-blue-800",
                          item.status === "resolved" && "bg-green-100 text-green-800"
                        )}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDateBR(item.createdAt)}</p>
                </div>

                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.status === "open" && (
                    <button
                      onClick={() => updateStatus(item._id, "read")}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Marcar como lido
                    </button>
                  )}
                  {item.status !== "resolved" && (
                    <button
                      onClick={() => updateStatus(item._id, "resolved")}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Resolvido
                    </button>
                  )}
                  {item.status === "resolved" && (
                    <button
                      onClick={() => updateStatus(item._id, "open")}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Reabrir
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
