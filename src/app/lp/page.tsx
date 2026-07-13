"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Eye, Globe, MousePointerClick, Users } from "lucide-react";
import { LpDailyChart } from "@/components/lp/LpDailyChart";
import { LpEventsChart } from "@/components/lp/LpEventsChart";
import { LpFilters } from "@/components/lp/LpFilters";
import { LpSessionsTable } from "@/components/lp/LpSessionsTable";
import { LpSourceChart } from "@/components/lp/LpSourceChart";
import { MetricCard } from "@/components/MetricCard";
import { api } from "@/lib/api";
import { buildLpMetricsQuery, LP_EVENT_LABELS } from "@/lib/lpAnalytics";
import { formatDateBR } from "@/lib/utils";
import type { LpMetrics, LpMetricsQuery } from "@/types";

export default function LpMetricsPage() {
  const [query, setQuery] = useState<LpMetricsQuery>({ days: 7 });
  const [metrics, setMetrics] = useState<LpMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const qs = buildLpMetricsQuery(query);
    api
      .get<LpMetrics>(`/admin/lp/metrics?${qs}`)
      .then(({ data }) => setMetrics(data))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const conversionPct = metrics ? Math.round(metrics.conversionRate * 100) : 0;

  const periodLabel = metrics
    ? `${formatDateBR(metrics.from)} — ${formatDateBR(metrics.to)}`
    : "";

  const handleSelectSession = (sessionId: string) => {
    setQuery((prev) => ({
      ...prev,
      sessionId: prev.sessionId === sessionId ? undefined : sessionId,
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Landing page</h1>
        <p className="text-sm text-gray-500 mt-1">
          Acessos em gestaglic.com.br, origem das campanhas e jornada até o app
        </p>
      </div>

      <LpFilters
        query={query}
        availableSources={metrics?.availableSources ?? []}
        onChange={setQuery}
      />

      {loading ? (
        <p className="text-sm text-gray-400">Carregando métricas...</p>
      ) : !metrics ? (
        <p className="text-sm text-red-500">Erro ao carregar métricas.</p>
      ) : (
        <>
          <section>
            <p className="text-xs text-gray-400 mb-3">{periodLabel}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Visualizações"
                value={metrics.pageViews}
                sub={`${metrics.days} dias no recorte`}
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
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Evolução por dia
              </h2>
              <LpDailyChart data={metrics.byDay} />
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Origem (UTM)
              </h2>
              <LpSourceChart data={metrics.bySource} />
              {metrics.bySource.length > 0 && (
                <table className="w-full text-xs mt-4 border-t border-gray-100 pt-3">
                  <thead>
                    <tr className="text-gray-400 text-left">
                      <th className="pb-1 font-medium">Fonte</th>
                      <th className="pb-1 font-medium text-right">Views</th>
                      <th className="pb-1 font-medium text-right">Sessões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.bySource.map((row) => (
                      <tr
                        key={row.source}
                        className="border-t border-gray-50 cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setQuery((prev) => ({
                            ...prev,
                            utmSource:
                              prev.utmSource === row.source ? undefined : row.source,
                          }))
                        }
                      >
                        <td className="py-1.5 text-gray-800">{row.source}</td>
                        <td className="py-1.5 text-right text-gray-600">{row.pageViews}</td>
                        <td className="py-1.5 text-right text-gray-600">
                          {row.uniqueSessions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Eventos</h2>
              <LpEventsChart data={metrics.byEvent} />
              <ul className="space-y-1.5 text-xs mt-4 border-t border-gray-100 pt-3">
                {metrics.byEvent.map((row) => (
                  <li key={row.event} className="flex justify-between">
                    <span className="text-gray-700">
                      {LP_EVENT_LABELS[row.event] ?? row.event}
                    </span>
                    <span className="font-semibold text-gray-900">{row.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-xl bg-white border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Visitantes (sessões)
            </h2>
            <LpSessionsTable
              sessions={metrics.topSessions}
              activeSessionId={query.sessionId}
              onSelectSession={handleSelectSession}
            />
          </section>

          {metrics.topPaths.length > 0 && (
            <section className="rounded-xl bg-white border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Páginas mais vistas</h2>
              <ul className="space-y-1 text-xs">
                {metrics.topPaths.map((row) => (
                  <li
                    key={row.path}
                    className="flex justify-between text-gray-600 cursor-pointer hover:text-brand-600"
                    onClick={() =>
                      setQuery((prev) => ({
                        ...prev,
                        path: prev.path === row.path ? undefined : row.path,
                      }))
                    }
                  >
                    <span className="font-mono">{row.path}</span>
                    <span className="font-semibold">{row.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Tracking ativo na LP. Use links com{" "}
            <code className="bg-gray-100 px-1 rounded">?utm_source=instagram</code> para
            campanhas. Visitante = sessionId no navegador (anônimo). Período customizado: até
            180 dias.
            {metrics.filters.sessionId && (
              <>
                {" "}
                Filtrando sessão{" "}
                <code className="bg-gray-100 px-1 rounded font-mono">
                  {metrics.filters.sessionId.slice(0, 12)}…
                </code>
                .
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
