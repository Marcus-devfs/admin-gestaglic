"use client";

import { format, subDays } from "date-fns";
import { Select } from "@/components/ui/Select";
import { LP_DAY_PRESETS, LP_EVENT_LABELS } from "@/lib/lpAnalytics";
import type { LpMetricsQuery } from "@/types";

interface LpFiltersProps {
  query: LpMetricsQuery;
  availableSources: string[];
  onChange: (query: LpMetricsQuery) => void;
}

export function LpFilters({ query, availableSources, onChange }: LpFiltersProps) {
  const isCustomRange = Boolean(query.from && query.to);

  const setPresetDays = (days: number) => {
    onChange({
      days,
      from: undefined,
      to: undefined,
      utmSource: query.utmSource,
      event: query.event,
      sessionId: query.sessionId,
      path: query.path,
    });
  };

  const setCustomRange = (from: string, to: string) => {
    onChange({
      from,
      to,
      days: undefined,
      utmSource: query.utmSource,
      event: query.event,
      sessionId: query.sessionId,
      path: query.path,
    });
  };

  const updateFilter = (patch: Partial<LpMetricsQuery>) => {
    onChange({ ...query, ...patch });
  };

  const clearFilters = () => {
    onChange({ days: query.days ?? 7, from: query.from, to: query.to });
  };

  const hasActiveFilters = Boolean(
    query.utmSource || query.event || query.sessionId || query.path
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
          Período
        </span>
        {LP_DAY_PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setPresetDays(d)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !isCustomRange && query.days === d
                ? "bg-brand-600 text-white"
                : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          De
          <input
            type="date"
            value={query.from ?? weekAgo}
            max={query.to ?? today}
            onChange={(e) => setCustomRange(e.target.value, query.to ?? today)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Até
          <input
            type="date"
            value={query.to ?? today}
            min={query.from ?? weekAgo}
            max={today}
            onChange={(e) => setCustomRange(query.from ?? weekAgo, e.target.value)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-800"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Origem (UTM)"
          value={query.utmSource ?? ""}
          onChange={(value) => updateFilter({ utmSource: value || undefined })}
          options={[
            { value: "", label: "Todas" },
            ...availableSources.map((source) => ({ value: source, label: source })),
          ]}
        />

        <Select
          label="Tipo de evento"
          value={query.event ?? ""}
          onChange={(value) => updateFilter({ event: value || undefined })}
          options={[
            { value: "", label: "Todos" },
            ...Object.entries(LP_EVENT_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />

        <label className="flex flex-col gap-1 text-xs text-gray-500 sm:col-span-2">
          Sessão (visitante)
          <input
            type="text"
            value={query.sessionId ?? ""}
            onChange={(e) => updateFilter({ sessionId: e.target.value || undefined })}
            placeholder="Cole o sessionId para filtrar um visitante"
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-800 font-mono"
          />
        </label>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
