"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDateBR } from "@/lib/utils";
import type { PixPayment } from "@/types";

export default function AssinaturasPage() {
  const [payments, setPayments] = useState<PixPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PixPayment[]>("/admin/payments")
      .then(({ data }) => setPayments(data))
      .finally(() => setLoading(false));
  }, []);

  const pending = payments.filter((p) => p.status === "generated" || p.status === "pending").length;
  const paid = payments.filter((p) => p.status === "paid").length;

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinaturas & Pagamentos</h1>
        <p className="text-sm text-gray-500">
          {pending} pendentes · {paid} pagos · {formatCurrency(paid * 9.9)} receita
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3 font-medium">Usuária</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Criado</th>
              <th className="px-4 py-3 font-medium">Pago em</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum Pix registrado ainda
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const user = typeof p.userId === "object" ? p.userId : null;
                return (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : "Gerado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDateBR(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.paidAt ? formatDateBR(p.paidAt) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Pagamentos via Asaas. &ldquo;Pendente&rdquo; = checkout criado, aguardando Pix. Premium é
        liberado automaticamente pelo webhook após confirmação.
      </p>
    </div>
  );
}
