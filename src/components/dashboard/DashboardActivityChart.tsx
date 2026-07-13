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
import type { DashboardMetrics } from "@/types";

interface DashboardActivityChartProps {
  data: DashboardMetrics["activityByDay"];
}

export function DashboardActivityChart({ data }: DashboardActivityChartProps) {
  if (!data.length) {
    return <p className="text-xs text-gray-400 py-8 text-center">Sem atividade no período.</p>;
  }

  const chartData = data.map((row) => ({
    ...row,
    label: format(parseISO(row.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
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
        <Bar dataKey="medicoes" name="Medições" fill="#fbcfe8" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Line
          type="monotone"
          dataKey="logins"
          name="Logins"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="newUsers"
          name="Novas usuárias"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="registrations"
          name="Cadastros"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
