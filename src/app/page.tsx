"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Database,
  DollarSign,
  ExternalLink,
  Bell,
  Activity,
  Crown,
  Globe,
  FileDown,
} from "lucide-react";
import { DashboardActivityChart } from "@/components/dashboard/DashboardActivityChart";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";
import { formatCurrency } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";

const CHART_DAYS = [7, 14, 30, 60] as const;

export default function DashboardPage() {
  const [days, setDays] = useState<number>(30);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<DashboardMetrics>(`/admin/dashboard?days=${days}`)
      .then(({ data }) => setMetrics(data))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-gray-400">Carregando métricas...</p>;
  }

  if (!metrics) {
    return <p className="text-sm text-red-500">Erro ao carregar dashboard.</p>;
  }

  const periodMedicoes = metrics.activityByDay.reduce((sum, d) => sum + d.medicoes, 0);
  const periodLogins = metrics.activityByDay.reduce((sum, d) => sum + d.logins, 0);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Saúde do negócio GestaGlic</p>
        </div>
        <div className="flex gap-2">
          {CHART_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Usuárias cadastradas"
            value={metrics.users.total}
            sub={`${metrics.users.newLast7Days} novas nos últimos 7 dias`}
            icon={Users}
          />
          <MetricCard
            label="Premium"
            value={metrics.users.premium}
            sub={`${metrics.financial.premiumUsers} com pagamento confirmado`}
            icon={Crown}
            accent="amber"
          />
          <MetricCard
            label="Medições no período"
            value={periodMedicoes}
            sub={`${metrics.infra.medicoes} no total · ${days} dias`}
            icon={Activity}
            accent="green"
          />
          <MetricCard
            label="Recebido líquido"
            value={formatCurrency(metrics.financial.revenueNet)}
            sub={`Bruto ${formatCurrency(metrics.financial.revenue)}`}
            icon={DollarSign}
            accent="green"
          />
        </div>
      </section>

      {metrics.activityByDay.length > 0 && (
        <section className="rounded-xl bg-white border border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Atividade no app</h2>
            <p className="text-xs text-gray-400">
              {periodLogins} logins · {periodMedicoes} medições nos últimos {days} dias
            </p>
          </div>
          <DashboardActivityChart data={metrics.activityByDay} />
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Financeiro
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="A receber (bruto)"
            value={formatCurrency(metrics.financial.pendingGross)}
            sub={`${metrics.financial.pendingCount} checkout${metrics.financial.pendingCount === 1 ? "" : "s"} pendente${metrics.financial.pendingCount === 1 ? "" : "s"}`}
            icon={DollarSign}
            accent="amber"
          />
          <MetricCard
            label="Recebido bruto"
            value={formatCurrency(metrics.financial.revenue)}
            sub={`${metrics.financial.paid} pagamento${metrics.financial.paid === 1 ? "" : "s"}`}
            icon={DollarSign}
          />
          <MetricCard
            label="Taxas Asaas"
            value={formatCurrency(metrics.financial.asaasFees)}
            sub="Sobre pagamentos confirmados"
            icon={DollarSign}
            accent="blue"
          />
          <Link href="/assinaturas">
            <MetricCard
              label="Ver financeiro"
              value="→"
              sub="Histórico e checkouts"
              icon={DollarSign}
              accent="blue"
            />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Engajamento
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Ativas (7 dias)"
            value={metrics.infra.activity.activeUsers7d}
            sub={`${metrics.infra.activity.logins7d} logins`}
            icon={UserPlus}
            accent="green"
          />
          <MetricCard
            label="PDFs baixados"
            value={metrics.infra.activity.pdfDownloads7d}
            sub="Últimos 7 dias"
            icon={FileDown}
            accent="blue"
          />
          <MetricCard
            label="Lembretes ativos"
            value={metrics.notifications.enabled}
            sub="Push habilitado"
            icon={Bell}
          />
          <Link href="/lp">
            <MetricCard
              label="Landing page"
              value="→"
              sub="Métricas gestaglic.com.br"
              icon={Globe}
              accent="blue"
            />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Infraestrutura
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="Documentos MongoDB"
            value={metrics.infra.totalDocuments}
            sub={`${metrics.infra.users} usuárias · ${metrics.infra.medicoes} medições · ${metrics.infra.accessLogs} logs`}
            icon={Database}
          />
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span className="font-medium uppercase tracking-wide">
                {metrics.infra.storageSource === "mongodb" ? "Armazenamento real" : "Uso estimado"}
              </span>
              <span className="font-semibold text-gray-700">
                {metrics.infra.estimatedStorageMB} MB · {metrics.infra.storageUsagePct}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.infra.storageUsagePct > 80 ? "bg-amber-500" : "bg-brand-500"
                }`}
                style={{ width: `${metrics.infra.storageUsagePct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Limite M0: {metrics.infra.mongoLimitMB} MB
              {metrics.infra.dataSizeMB != null && ` · dados ${metrics.infra.dataSizeMB} MB`}
              {metrics.infra.storageSource === "mongodb"
                ? " · medido via db.stats()"
                : " · estimativa por documentos"}
            </p>
            {metrics.infra.vercelAnalyticsUrl && (
              <a
                href={metrics.infra.vercelAnalyticsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 mt-3 hover:text-brand-700"
              >
                Vercel Analytics <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/usuarios"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-200 hover:text-brand-700"
        >
          Usuárias →
        </Link>
        <Link
          href="/notificacoes"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-200 hover:text-brand-700"
        >
          Notificações →
        </Link>
        <Link
          href="/lp"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-200 hover:text-brand-700"
        >
          Landing page →
        </Link>
      </div>
    </div>
  );
}
