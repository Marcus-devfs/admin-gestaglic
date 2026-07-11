"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Database,
  DollarSign,
  ExternalLink,
  Bell,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";
import { formatCurrency } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardMetrics>("/admin/dashboard")
      .then(({ data }) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Carregando métricas...</p>;
  }

  if (!metrics) {
    return <p className="text-sm text-red-500">Erro ao carregar dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Saúde do negócio GestaGlic</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Usuárias</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Total cadastradas"
            value={metrics.users.total}
            icon={Users}
          />
          <MetricCard
            label="Novos (7 dias)"
            value={metrics.users.newLast7Days}
            sub="Grávidas que criaram conta"
            icon={UserPlus}
            accent="green"
          />
          <Link href="/usuarios">
            <MetricCard
              label="Ver usuárias"
              value="→"
              sub="Lista completa"
              icon={Users}
              accent="blue"
            />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Financeiro</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Pix gerados (R$ 9,90)"
            value={metrics.financial.generated}
            sub="Viram o paywall"
            icon={DollarSign}
            accent="amber"
          />
          <MetricCard
            label="Pix pagos"
            value={metrics.financial.paid}
            sub={`${metrics.financial.premiumUsers} premium`}
            icon={DollarSign}
            accent="green"
          />
          <MetricCard
            label="Receita"
            value={formatCurrency(metrics.financial.revenue)}
            sub="Confirmados"
            icon={DollarSign}
          />
          <Link href="/assinaturas">
            <MetricCard
              label="Assinaturas"
              value="→"
              sub="Ver detalhes"
              icon={DollarSign}
              accent="blue"
            />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Infraestrutura</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Documentos MongoDB"
            value={metrics.infra.totalDocuments}
            sub={`${metrics.infra.users} usuárias · ${metrics.infra.medicoes} medições · ${metrics.infra.accessLogs} logs`}
            icon={Database}
          />
          <MetricCard
            label={metrics.infra.storageSource === "mongodb" ? "Armazenamento real" : "Uso estimado"}
            value={`${metrics.infra.estimatedStorageMB} MB`}
            sub={
              metrics.infra.dataSizeMB != null
                ? `${metrics.infra.storageUsagePct}% de ${metrics.infra.mongoLimitMB} MB (M0) · dados ${metrics.infra.dataSizeMB} MB`
                : `${metrics.infra.storageUsagePct}% de ${metrics.infra.mongoLimitMB} MB (M0)`
            }
            icon={Database}
            accent={metrics.infra.storageUsagePct > 80 ? "amber" : "blue"}
          />
          <MetricCard
            label="Atividade (7 dias)"
            value={metrics.infra.activity.activeUsers7d}
            sub={`${metrics.infra.activity.logins7d} logins · ${metrics.infra.activity.pdfDownloads7d} PDFs`}
            icon={Activity}
            accent="green"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] rounded-xl bg-white border border-gray-100 p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Armazenamento MongoDB Atlas M0</span>
              <span>{metrics.infra.storageUsagePct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${metrics.infra.storageUsagePct}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              {metrics.infra.storageSource === "mongodb"
                ? "Medido via db.stats() na API — sem depender da Vercel"
                : "Estimativa por contagem de documentos"}
            </p>
          </div>
          {metrics.infra.vercelAnalyticsUrl && (
            <a
              href={metrics.infra.vercelAnalyticsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <MetricCard
                label="Vercel Analytics"
                value="Abrir →"
                sub="Tráfego web (opcional)"
                icon={ExternalLink}
                accent="blue"
              />
            </a>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notificações</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Lembretes ativos"
            value={metrics.notifications.enabled}
            sub="Usuárias com push habilitado"
            icon={Bell}
          />
          <Link href="/notificacoes">
            <MetricCard
              label="Dispositivos push"
              value={metrics.notifications.pushSubscriptions}
              sub="Ver detalhes →"
              icon={Bell}
              accent="blue"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
