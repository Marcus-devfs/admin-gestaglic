"use client";

import { formatDateBR } from "@/lib/utils";
import type { LpMetrics } from "@/types";

interface LpSessionsTableProps {
  sessions: LpMetrics["topSessions"];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
}

export function LpSessionsTable({
  sessions,
  activeSessionId,
  onSelectSession,
}: LpSessionsTableProps) {
  if (!sessions.length) {
    return <p className="text-xs text-gray-400 py-4">Nenhuma sessão no período.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 text-left border-b border-gray-100">
            <th className="pb-2 pr-3 font-medium">Sessão</th>
            <th className="pb-2 pr-3 font-medium">Origem</th>
            <th className="pb-2 pr-3 font-medium text-right">Views</th>
            <th className="pb-2 pr-3 font-medium text-right">CTAs</th>
            <th className="pb-2 pr-3 font-medium text-right">Eventos</th>
            <th className="pb-2 font-medium text-right">Última visita</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((row) => {
            const isActive = activeSessionId === row.sessionId;
            return (
              <tr
                key={row.sessionId}
                className={`border-b border-gray-50 cursor-pointer transition-colors ${
                  isActive ? "bg-brand-50" : "hover:bg-gray-50"
                }`}
                onClick={() => onSelectSession(row.sessionId)}
              >
                <td className="py-2 pr-3 font-mono text-gray-700">
                  {row.sessionId.slice(0, 8)}…
                </td>
                <td className="py-2 pr-3 text-gray-600">{row.utmSource}</td>
                <td className="py-2 pr-3 text-right text-gray-800">{row.pageViews}</td>
                <td className="py-2 pr-3 text-right text-green-700">{row.ctaClicks}</td>
                <td className="py-2 pr-3 text-right text-gray-600">{row.events}</td>
                <td className="py-2 text-right text-gray-500">
                  {formatDateBR(row.lastSeen)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-400 mt-2">
        Clique em uma sessão para filtrar todo o painel por esse visitante.
      </p>
    </div>
  );
}
