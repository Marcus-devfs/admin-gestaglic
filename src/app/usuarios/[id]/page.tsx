"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Bell,
  FileText,
  Activity,
  Clock,
  LogIn,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDateBR } from "@/lib/utils";
import type { UserDetailResponse } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  session_restore: "Sessão restaurada",
  pdf_download: "Download PDF",
  register: "Cadastro",
};

type Tab = "medicoes" | "pagamentos" | "logs";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("medicoes");
  const [updatingPremium, setUpdatingPremium] = useState(false);

  const load = () => {
    api
      .get<UserDetailResponse>(`/admin/users/${id}`)
      .then(({ data: d }) => setData(d))
      .catch(() => router.push("/usuarios"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const togglePremium = async () => {
    if (!data) return;
    setUpdatingPremium(true);
    try {
      await api.patch(`/admin/users/${id}/premium`, {
        is_premium: !data.user.is_premium,
      });
      load();
    } finally {
      setUpdatingPremium(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Carregando...</p>;
  }

  if (!data) return null;

  const { user, medicoes, payments, accessLogs, stats } = data;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "medicoes", label: "Medições", count: stats.totalMedicoes },
    { key: "pagamentos", label: "Pagamentos", count: payments.length },
    { key: "logs", label: "Logs de acesso", count: accessLogs.length },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/usuarios"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para usuárias
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.is_premium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            {user.telephone && (
              <p className="text-sm text-gray-400 mt-0.5">{user.telephone}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Cadastro: {user.createdAt ? formatDateBR(user.createdAt) : "—"}
              {stats.lastLoginAt && (
                <> · Último login: {formatDateBR(stats.lastLoginAt)}</>
              )}
            </p>
          </div>

          <button
            onClick={togglePremium}
            disabled={updatingPremium}
            className={cn(
              "shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
              user.is_premium
                ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                : "bg-brand-600 text-white hover:bg-brand-700"
            )}
          >
            {updatingPremium
              ? "Salvando..."
              : user.is_premium
                ? "Remover Premium"
                : "Ativar Premium manualmente"}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Medições", value: stats.totalMedicoes, icon: Activity },
            { label: "Média glicemia", value: stats.avgGlucose ? `${stats.avgGlucose} mg/dL` : "—", icon: Activity },
            { label: "PDFs baixados", value: stats.pdfDownloads, icon: FileText },
            {
              label: "Push",
              value: stats.notificationsEnabled ? `${stats.pushDevices} disp.` : "Off",
              icon: Bell,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {tab === "medicoes" && (
          <>
            {medicoes.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                Nenhuma medição registrada
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Dieta</th>
                    <th className="px-4 py-3 hidden md:table-cell">Alimentação</th>
                  </tr>
                </thead>
                <tbody>
                  {medicoes.map((m) => (
                    <tr key={m._id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateBR(m.date)}
                      </td>
                      <td className="px-4 py-3 font-medium">{m.period}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {m.value} <span className="text-xs font-normal text-gray-400">mg/dL</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                        {m.diet ? "Sim" : "Não"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs truncate max-w-[160px]">
                        {m.food || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {stats.totalMedicoes > 50 && (
              <p className="px-4 py-3 text-xs text-gray-400 border-t border-gray-50">
                Exibindo as 50 medições mais recentes de {stats.totalMedicoes}
              </p>
            )}
          </>
        )}

        {tab === "pagamentos" && (
          <>
            {payments.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                Nenhum Pix registrado
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 py-3">Bruto</th>
                    <th className="px-4 py-3">Taxa</th>
                    <th className="px-4 py-3">Líquido</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Pago em</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        {p.feeAmount != null ? `-${formatCurrency(p.feeAmount)}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-green-700">
                        {p.netAmount != null ? formatCurrency(p.netAmount) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            p.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {p.status === "paid"
                          ? "Pago"
                          : p.status === "pending"
                            ? "Checkout pendente"
                            : "Gerado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {p.paidAt ? formatDateBR(p.paidAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {tab === "logs" && (
          <>
            {accessLogs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Nenhum log ainda — logs são registrados a partir de agora
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {accessLogs.map((log) => (
                  <li key={log._id} className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-0.5 rounded-lg bg-gray-100 p-1.5">
                      <LogIn className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                        {log.ip && <> · IP {log.ip}</>}
                      </p>
                      {log.metadata && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {JSON.stringify(log.metadata)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
