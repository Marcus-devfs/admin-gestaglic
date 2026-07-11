"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Flag } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDateBR } from "@/lib/utils";
import type { ForumPostAdmin, ForumReport } from "@/types";

export default function ComunidadeAdminPage() {
  const [posts, setPosts] = useState<ForumPostAdmin[]>([]);
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [tab, setTab] = useState<"posts" | "reports">("posts");
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      api.get<ForumPostAdmin[]>("/admin/forum/posts"),
      api.get<ForumReport[]>("/admin/forum/reports?status=pending"),
    ])
      .then(([postsRes, reportsRes]) => {
        setPosts(postsRes.data);
        setReports(reportsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleHidden = async (post: ForumPostAdmin) => {
    await api.patch(`/admin/forum/posts/${post._id}`, { hidden: !post.hidden });
    load();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Excluir post e comentários permanentemente?")) return;
    await api.delete(`/admin/forum/posts/${id}`);
    load();
  };

  const resolveReport = async (id: string, hidePost: boolean) => {
    await api.patch(`/admin/forum/reports/${id}`, {
      status: hidePost ? "resolved" : "dismissed",
      hidePost,
    });
    load();
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comunidade</h1>
        <p className="text-sm text-gray-500 mt-1">
          Moderação de posts e denúncias do fórum
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "posts" as const, label: "Posts", count: posts.length },
          { key: "reports" as const, label: "Denúncias", count: reports.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              tab === t.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500"
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 text-xs">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Nenhum post ainda.</p>
          ) : (
            posts.map((p) => (
              <div
                key={p._id}
                className={cn(
                  "rounded-2xl border bg-white p-5 shadow-sm",
                  p.hidden && "opacity-60 border-red-100"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-brand-600">{p.category}</span>
                      {p.hidden && (
                        <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Oculto
                        </span>
                      )}
                      {p.reportCount > 0 && (
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flag className="h-3 w-3" /> {p.reportCount}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 font-bold text-gray-900">{p.title}</h2>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.body}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {p.userId?.name} ({p.userId?.email}) · {formatDateBR(p.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.likesCount} apoios · {p.commentsCount} comentários
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() => toggleHidden(p)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-brand-600"
                    >
                      {p.hidden ? (
                        <><Eye className="h-3.5 w-3.5" /> Reexibir</>
                      ) : (
                        <><EyeOff className="h-3.5 w-3.5" /> Ocultar</>
                      )}
                    </button>
                    <button
                      onClick={() => deletePost(p._id)}
                      className="inline-flex items-center gap-1 text-xs text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Nenhuma denúncia pendente.</p>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
                <p className="text-sm font-semibold text-gray-900">
                  Post: {r.postId?.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Denunciado por {r.reporterId?.name} · {r.reason}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatDateBR(r.createdAt)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => resolveReport(r._id, true)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Ocultar post
                  </button>
                  <button
                    onClick={() => resolveReport(r._id, false)}
                    className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
