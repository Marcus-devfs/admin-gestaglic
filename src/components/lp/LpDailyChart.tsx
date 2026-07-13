"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LpMetrics } from "@/types";

interface LpDailyChartProps {
  data: LpMetrics["byDay"];
}

export function LpDailyChart({ data }: LpDailyChartProps) {
  if (!data.length) {
    return <p className="text-xs text-gray-400 py-8 text-center">Sem dados no período.</p>;
  }

  const chartData = data.map((row) => ({
    ...row,
    label: format(parseISO(row.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11 }}
          stroke="#9ca3af"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as { date?: string } | undefined;
            return item?.date
              ? format(parseISO(item.date), "dd/MM/yyyy", { locale: ptBR })
              : "";
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="left"
          dataKey="ctaClicks"
          name="Cliques CTA"
          fill="#86efac"
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="pageViews"
          name="Visualizações"
          stroke="#db2777"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#db2777" }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="uniqueSessions"
          name="Sessões únicas"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
