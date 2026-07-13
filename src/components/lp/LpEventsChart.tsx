"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LP_EVENT_LABELS } from "@/lib/lpAnalytics";
import type { LpMetrics } from "@/types";

interface LpEventsChartProps {
  data: LpMetrics["byEvent"];
}

export function LpEventsChart({ data }: LpEventsChartProps) {
  if (!data.length) {
    return <p className="text-xs text-gray-400 py-8 text-center">Nenhum evento registrado.</p>;
  }

  const chartData = data.map((row) => ({
    name: LP_EVENT_LABELS[row.event] ?? row.event,
    count: row.count,
    event: row.event,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 0, right: 8, left: -16, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9 }}
          stroke="#9ca3af"
          interval={0}
          angle={-20}
          textAnchor="end"
          height={56}
        />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Bar dataKey="count" name="Ocorrências" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
