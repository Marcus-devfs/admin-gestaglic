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
import type { LpMetrics } from "@/types";

interface LpSourceChartProps {
  data: LpMetrics["bySource"];
}

export function LpSourceChart({ data }: LpSourceChartProps) {
  if (!data.length) {
    return <p className="text-xs text-gray-400 py-8 text-center">Sem dados de origem.</p>;
  }

  const chartData = data.slice(0, 8).map((row) => ({
    name: row.source.length > 14 ? `${row.source.slice(0, 14)}…` : row.source,
    fullName: row.source,
    pageViews: row.pageViews,
    sessions: row.uniqueSessions,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={88}
          tick={{ fontSize: 10 }}
          stroke="#9ca3af"
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
          formatter={(value, name) => [value, name === "pageViews" ? "Views" : "Sessões"]}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as { fullName?: string } | undefined;
            return item?.fullName ?? "";
          }}
        />
        <Bar dataKey="pageViews" name="Views" fill="#db2777" radius={[0, 4, 4, 0]} maxBarSize={18} />
        <Bar dataKey="sessions" name="Sessões" fill="#93c5fd" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
