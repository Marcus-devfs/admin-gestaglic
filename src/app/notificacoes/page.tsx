"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDateBR } from "@/lib/utils";
import type { AdminUser, DashboardMetrics } from "@/types";

export default function NotificacoesPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardMetrics>("/admin/dashboard"),
      api.get<AdminUser[]>("/admin/users"),
    ])
      .then(([dash, usersRes]) => {
        setMetrics(dash.data);
        setUsers(usersRes.data.filter((u) => u.preferences?.notificationsEnabled));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
        <p className="text-sm text-gray-500">
          {metrics?.notifications.enabled ?? 0} com lembretes ·{" "}
          {metrics?.notifications.pushSubscriptions ?? 0} dispositivos push
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs text-gray-500 uppercase">Lembretes ativos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {metrics?.notifications.enabled ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs text-gray-500 uppercase">Dispositivos registrados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {metrics?.notifications.pushSubscriptions ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Usuárias com push ativo</h2>
        </div>
        {users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Nenhuma usuária com notificações ativas
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {users.map((u) => (
              <li key={u._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Ativo</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
