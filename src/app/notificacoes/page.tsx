"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2, Smartphone, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDateTimeBR } from "@/lib/utils";
import type {
  AdminUser,
  DashboardMetrics,
  PushDeliveryItem,
  PushDeliveryStatus,
  PushDeliveryType,
  PushNotificationStats,
} from "@/types";

const TYPE_LABELS: Record<PushDeliveryType, string> = {
  meal_reminder: "Lembrete de medição",
  premium_activated: "Premium ativado",
  payment_pending: "Pagamento pendente",
  checkout_reminder: "Lembrete de checkout",
  generic: "Geral",
};

const STATUS_LABELS: Record<PushDeliveryStatus, string> = {
  delivered: "Entregue",
  partial: "Parcial",
  failed: "Falhou",
  skipped: "Ignorado",
};

const STATUS_STYLES: Record<PushDeliveryStatus, string> = {
  delivered: "bg-green-100 text-green-800",
  partial: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  skipped: "bg-gray-100 text-gray-600",
};

const DAY_OPTIONS = [1, 7, 14, 30] as const;

function userLabel(userId: PushDeliveryItem["userId"]) {
  if (typeof userId === "object" && userId) return userId;
  return { name: "—", email: "—" };
}

export default function NotificacoesPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PushNotificationStats | null>(null);
  const [deliveries, setDeliveries] = useState<PushDeliveryItem[]>([]);
  const [days, setDays] = useState<number>(7);
  const [typeFilter, setTypeFilter] = useState<"all" | PushDeliveryType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PushDeliveryStatus>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ days: String(days), limit: "80" });
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    Promise.all([
      api.get<DashboardMetrics>("/admin/dashboard"),
      api.get<AdminUser[]>("/admin/users"),
      api.get<PushNotificationStats>(`/admin/notifications/stats?days=${days}`),
      api.get<{ items: PushDeliveryItem[] }>(`/admin/notifications/deliveries?${params}`),
    ])
      .then(([dash, usersRes, statsRes, deliveriesRes]) => {
        setMetrics(dash.data);
        setUsers(usersRes.data.filter((u) => u.preferences?.notificationsEnabled));
        setStats(statsRes.data);
        setDeliveries(deliveriesRes.data.items ?? []);
      })
      .catch(() => {
        setStats(null);
        setDeliveries([]);
      })
      .finally(() => setLoading(false));
  }, [days, typeFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !metrics) {
    return <p className="text-sm text-gray-400">Carregando...</p>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-sm text-gray-500 mt-1">
            {metrics?.notifications.enabled ?? 0} com lembretes ·{" "}
            {metrics?.notifications.pushSubscriptions ?? 0} dispositivos · histórico de entregas
          </p>
        </div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                days === d
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {d === 1 ? "24h" : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Enviadas (período)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">{stats?.last24h ?? 0} nas últimas 24h</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Entregues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(stats?.byStatus.delivered ?? 0) + (stats?.byStatus.partial ?? 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.byStatus.partial ?? 0} parcial · {stats?.byStatus.failed ?? 0} falha
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-2.5 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Dispositivos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.devicesSent ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                enviados · {stats?.devicesFailed ?? 0} removidos/falha
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Opt-in ativo</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {metrics?.notifications.enabled ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {metrics?.notifications.pushSubscriptions ?? 0} devices registrados
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Histórico de entregas</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700"
            >
              <option value="all">Todos os tipos</option>
              {(Object.keys(TYPE_LABELS) as PushDeliveryType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700"
            >
              <option value="all">Todos os status</option>
              {(Object.keys(STATUS_LABELS) as PushDeliveryStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Atualizando...</p>
        ) : deliveries.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MinusCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhuma entrega registrada neste filtro.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
              O histórico começa a gravar após o deploy da API — envios futuros de lembrete,
              premium e cobrança aparecem aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {deliveries.map((item) => {
              const user = userLabel(item.userId);
              return (
                <li key={item._id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-[10px] font-semibold rounded-full px-2 py-0.5",
                          STATUS_STYLES[item.status]
                        )}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                      <span className="text-[10px] font-medium rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                      {item.meta?.period && (
                        <span className="text-[10px] text-gray-400">{item.meta.period}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                      <span className="font-medium">{item.title}</span>
                      {item.body ? ` — ${item.body}` : ""}
                    </p>
                    {item.skipReason && (
                      <p className="text-[11px] text-gray-400 mt-1">Motivo: {item.skipReason}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <p className="text-xs text-gray-500">{formatDateTimeBR(item.createdAt)}</p>
                    <p className="text-xs text-gray-700">
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.devicesSent}
                      </span>
                      {item.devicesFailed > 0 && (
                        <span className="inline-flex items-center gap-1 text-red-600 ml-2">
                          <XCircle className="h-3 w-3" />
                          {item.devicesFailed}
                        </span>
                      )}
                      <span className="text-gray-400 ml-1">device(s)</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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
                <div className="text-right">
                  <span className="text-xs text-green-600 font-medium">Ativo</span>
                  <p className="text-[11px] text-gray-400">
                    {u.pushSubscriptions?.length ?? 0} device(s)
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
