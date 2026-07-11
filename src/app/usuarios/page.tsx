"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateBR } from "@/lib/utils";
import type { AdminUser } from "@/types";

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AdminUser[]>("/admin/users")
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuárias</h1>
        <p className="text-sm text-gray-500">
          {users.length} cadastradas · clique para ver detalhes
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">PDFs</th>
              <th className="px-4 py-3 font-medium">Push</th>
              <th className="px-4 py-3 font-medium">Premium</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-b border-gray-50 last:border-0 hover:bg-brand-50/30"
              >
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.pdf_downloads_count ?? 0}</td>
                <td className="px-4 py-3">
                  {u.preferences?.notificationsEnabled ? (
                    <span className="text-green-600 text-xs font-medium">Ativo</span>
                  ) : (
                    <span className="text-gray-400 text-xs">Off</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.is_premium ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Premium
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Free</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u.createdAt ? formatDateBR(u.createdAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/usuarios/${u._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Detalhes
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
