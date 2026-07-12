"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Eye, Globe, MousePointerClick, Users } from "lucide-react";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";
import type { LpMetrics } from "@/types";

const EVENT_LABELS: Record<string, string> = {
  page_view: "Visualizações",
  cta_install: "Clique instalar",
  cta_app: "Clique ir ao app",
  cta_register: "Clique cadastro",
  install_banner_click: "Banner instalar",
  install_modal_open: "Modal instalação",
};

export default function LpMetricsPage() {
  const [days, setDays] = useState(7);
  const [metrics, setMetrics] = useState<LpMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<LpMetrics>(`/admin/lp/metrics?days=${days}`)
      .then(({ data }) => setMetrics(data))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, [days]);

  const conversionPct = metrics ? Math.round(metrics.conversionRate * 100) : 0;
  const maxDayViews = metrics?.byDay.reduce((m, d) => Math.max(m, d.pageViews), 1) ?? 1;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing page</h1>
          <p className="text-sm text-gray-500 mt-1">
            Acessos em gestaglic.com.br e cliques para o app
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                days === d
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {d} dias
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando métricas...</p>
      ) : !metrics ? (
        <p className="text-sm text-red-500">Erro ao carregar métricas.</p>
      ) : (
        <>
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Visualizações"
                value={metrics.pageViews}
                sub={`Últimos ${metrics.days} dias`}
                icon={Eye}
              />
              <MetricCard
                label="Visitantes únicos"
                value={metrics.uniqueSessions}
                sub="Sessões com page view"
                icon={Users}
                accent="blue"
              />
              <MetricCard
                label="Cliques para o app"
                value={metrics.ctaClicks}
                sub="Instalar + entrar + banner + modal"
                icon={MousePointerClick}
                accent="green"
              />
              <MetricCard
                label="Taxa de clique"
                value={`${conversionPct}%`}
                sub="Cliques ÷ visualizações"
                icon={ArrowRight}
                accent="amber"
              />
            </div>
          </section>

          {metrics.byDay.length > 0 && (
            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Por dia</h2>
              <div className="space-y-2">
                {metrics.byDay.map((row) => (
                  <div key={row.date} className="flex items-center gap-3 text-xs">
                    <span className="w-20 shrink-0 text-gray-500">
                      {row.date.slice(5).replace("-", "/")}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${(row.pageViews / maxDayViews) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-gray-600">{row.pageViews} views</span>
                    <span className="w-14 text-right text-brand-600">{row.ctaClicks} cliques</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Origem (UTM)
              </h2>
              {metrics.bySource.length === 0 ? (
                <p className="text-xs text-gray-400">Sem dados de origem ainda.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 text-left">
                      <th className="pb-2 font-medium">Fonte</th>
                      <th className="pb-2 font-medium text-right">Views</th>
                      <th className="pb-2 font-medium text-right">Sessões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.bySource.map((row) => (
                      <tr key={row.source} className="border-t border-gray-50">
                        <td className="py-2 text-gray-800">{row.source}</td>
                        <td className="py-2 text-right text-gray-600">{row.pageViews}</td>
                        <td className="py-2 text-right text-gray-600">{row.uniqueSessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Eventos</h2>
              {metrics.byEvent.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum evento registrado.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {metrics.byEvent.map((row) => (
                    <li key={row.event} className="flex justify-between">
                      <span className="text-gray-700">
                        {EVENT_LABELS[row.event] ?? row.event}
                      </span>
                      <span className="font-semibold text-gray-900">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {metrics.topPaths.length > 0 && (
            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Páginas mais vistas</h2>
              <ul className="space-y-1 text-xs">
                {metrics.topPaths.map((row) => (
                  <li key={row.path} className="flex justify-between text-gray-600">
                    <span className="font-mono">{row.path}</span>
                    <span>{row.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Tracking ativo na LP após deploy. Use links com{" "}
            <code className="bg-gray-100 px-1 rounded">?utm_source=instagram</code> para medir
            campanhas. Visitante único = sessionId no navegador (não é pessoa exata).
          </p>
        </>
      )}
    </div>
  );
}
