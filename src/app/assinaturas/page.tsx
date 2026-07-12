"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownCircle,
  Clock,
  DollarSign,
  Percent,
  Settings2,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";
import { formatCurrency, formatDateBR } from "@/lib/utils";
import type { FinancialSummary, PixPayment, PremiumSettings } from "@/types";

function methodLabel(method?: string) {
  if (method === "card") return "Cartão";
  return "Pix";
}

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [payments, setPayments] = useState<PixPayment[]>([]);
  const [settings, setSettings] = useState<PremiumSettings | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [freeLimitInput, setFreeLimitInput] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const loadData = useCallback(() => {
    return Promise.all([
      api.get<FinancialSummary>("/admin/financial/summary"),
      api.get<PixPayment[]>("/admin/payments"),
      api.get<PremiumSettings>("/admin/settings/premium"),
    ]).then(([summaryRes, paymentsRes, settingsRes]) => {
      setSummary(summaryRes.data);
      setPayments(paymentsRes.data);
      setSettings(settingsRes.data);
      setPriceInput(String(settingsRes.data.premiumPrice));
      setFreeLimitInput(String(settingsRes.data.freePdfLimit));
    });
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const saveSettings = async () => {
    setSavingSettings(true);
    setSettingsMessage("");
    try {
      const { data } = await api.patch<PremiumSettings>("/admin/settings/premium", {
        premiumPrice: Number(priceInput.replace(",", ".")),
        freePdfLimit: Number(freeLimitInput),
      });
      setSettings(data);
      setPriceInput(String(data.premiumPrice));
      setFreeLimitInput(String(data.freePdfLimit));
      const summaryRes = await api.get<FinancialSummary>("/admin/financial/summary");
      setSummary(summaryRes.data);
      setSettingsMessage("Salvo! Novos checkouts Pix e cartão usarão estes valores.");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "msg" in err.response.data &&
        typeof err.response.data.msg === "string"
          ? err.response.data.msg
          : "Erro ao salvar. Verifique os valores (mín. R$ 5,00 em produção).";
      setSettingsMessage(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const filtered = payments.filter((p) => {
    if (filter === "paid") return p.status === "paid";
    if (filter === "pending") return p.status === "generated" || p.status === "pending";
    return true;
  });

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  if (!summary) {
    return <p className="text-sm text-red-500">Erro ao carregar financeiro.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pagamentos Asaas · preço atual {formatCurrency(summary.pixPrice)} (pagamento único)
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <Settings2 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Preço premium (pagamento único)</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Altere para campanhas ou testes em produção. Checkouts pendentes com preço antigo são
              invalidados automaticamente.
              {settings?.asaasMinCharge != null && !settings.asaasSandbox && (
                <> Mínimo Asaas produção: {formatCurrency(settings.asaasMinCharge)}.</>
              )}
              {settings?.updatedAt && (
                <> Última alteração: {formatDateBR(settings.updatedAt)}.</>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Valor (R$)</span>
            <input
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="14.90"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">PDFs grátis antes do paywall</span>
            <input
              type="number"
              min={1}
              max={100}
              value={freeLimitInput}
              onChange={(e) => setFreeLimitInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveSettings}
            disabled={savingSettings}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {savingSettings ? "Salvando..." : "Salvar configurações"}
          </button>
          {settingsMessage && (
            <p className="text-xs text-gray-600">{settingsMessage}</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Já entrou na conta
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Recebido bruto"
            value={formatCurrency(summary.received.gross)}
            sub={`${summary.received.count} pagamento${summary.received.count === 1 ? "" : "s"} confirmado${summary.received.count === 1 ? "" : "s"}`}
            icon={DollarSign}
            accent="blue"
          />
          <MetricCard
            label="Recebido líquido"
            value={formatCurrency(summary.received.net)}
            sub="Valor após taxas Asaas"
            icon={TrendingUp}
            accent="green"
          />
          <MetricCard
            label="Taxas Asaas"
            value={formatCurrency(summary.received.fees)}
            sub={
              summary.received.syncedCount < summary.received.count
                ? `${summary.received.syncedCount}/${summary.received.count} com taxa sincronizada`
                : "Descontadas do bruto"
            }
            icon={Percent}
            accent="amber"
          />
          <MetricCard
            label="Usuárias premium"
            value={summary.premiumUsers}
            sub="Com acesso ilimitado a PDFs"
            icon={Users}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Pendente para entrar
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="A receber (bruto)"
            value={formatCurrency(summary.pending.gross)}
            sub={
              summary.pending.count > 0
                ? `${summary.pending.count} checkout${summary.pending.count === 1 ? "" : "s"} aguardando pagamento`
                : "Nenhum pagamento pendente"
            }
            icon={Clock}
            accent="amber"
          />
          <MetricCard
            label="Potencial líquido"
            value={
              summary.pending.count > 0 && summary.received.count > 0
                ? formatCurrency(
                    summary.pending.gross *
                      (summary.received.net / summary.received.gross || 0)
                  )
                : "—"
            }
            sub={
              summary.pending.count > 0 && summary.received.gross > 0
                ? "Estimativa pela média das taxas já pagas"
                : summary.pending.count > 0
                  ? "Líquido conhecido após confirmação"
                  : "Sem estimativa"
            }
            icon={ArrowDownCircle}
            accent="blue"
          />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Histórico de pagamentos
          </h2>
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(
              [
                ["all", "Todos"],
                ["paid", "Pagos"],
                ["pending", "Pendentes"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Usuária</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Bruto</th>
                <th className="px-4 py-3 font-medium">Taxa</th>
                <th className="px-4 py-3 font-medium">Líquido</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Nenhum pagamento neste filtro
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const user = typeof p.userId === "object" ? p.userId : null;
                  const isPaid = p.status === "paid";
                  return (
                    <tr key={p._id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{methodLabel(p.paymentMethod)}</td>
                      <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3 text-red-600">
                        {p.feeAmount != null ? `-${formatCurrency(p.feeAmount)}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-green-700">
                        {p.netAmount != null ? formatCurrency(p.netAmount) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isPaid ? "Pago" : p.status === "pending" ? "Pendente" : "Gerado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {isPaid && p.paidAt
                          ? formatDateBR(p.paidAt)
                          : formatDateBR(p.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-gray-400 leading-relaxed">
        Taxas reais via API Asaas (netValue). Pagamentos antigos sincronizam ao abrir esta página.
        O líquido pendente é estimado pela média das taxas dos pagamentos já confirmados.
      </p>
    </div>
  );
}
