"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";
import { formatIRR } from "@/lib/format";

type Account = { id: string; code: string; nameFa: string; type: string };

export default function ReportsPage() {
  const trial = useQuery({
    queryKey: ["accounting", "trial-balance"],
    queryFn: async () => (await api.get("/accounting/trial-balance")).data as any[],
  });
  const pl = useQuery({
    queryKey: ["reports", "profit-loss"],
    queryFn: async () => (await api.get("/reports/profit-loss")).data as { revenue: number; expense: number; netProfit: number },
  });
  const bs = useQuery({
    queryKey: ["reports", "balance-sheet"],
    queryFn: async () => (await api.get("/reports/balance-sheet")).data as any,
  });
  const inv = useQuery({
    queryKey: ["reports", "inventory-valuation"],
    queryFn: async () => (await api.get("/reports/inventory-valuation")).data as { totalValue: number; rows: any[] },
  });
  const accounts = useQuery({
    queryKey: ["accounting", "accounts"],
    queryFn: async () => (await api.get("/accounting/accounts")).data as Account[],
  });

  const [ledgerAccountId, setLedgerAccountId] = useState("");
  const ledger = useQuery({
    queryKey: ["reports", "ledger", ledgerAccountId],
    queryFn: async () => (await api.get("/reports/ledger", { params: { accountId: ledgerAccountId } })).data as any,
    enabled: !!ledgerAccountId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">گزارش‌ها</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>سود و زیان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>درآمد: {formatIRR(pl.data?.revenue ?? 0)}</div>
            <div>هزینه: {formatIRR(pl.data?.expense ?? 0)}</div>
            <div className="font-semibold">سود خالص: {formatIRR(pl.data?.netProfit ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ترازنامه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>دارایی‌ها: {formatIRR(bs.data?.assets ?? 0)}</div>
            <div>بدهی‌ها: {formatIRR(bs.data?.liabilities ?? 0)}</div>
            <div>سرمایه: {formatIRR(bs.data?.equity ?? 0)}</div>
            <div className="text-xs opacity-70">Balanced: {String(bs.data?.isBalanced ?? false)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ارزش موجودی (AVG)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
          {formatIRR(inv.data?.totalValue ?? 0)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>دفترکل / گردش حساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={ledgerAccountId} onChange={(e) => setLedgerAccountId(e.target.value)}>
            <option value="">انتخاب حساب...</option>
            {(accounts.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.nameFa}
              </option>
            ))}
          </Select>
          {ledgerAccountId ? (
            <div className="overflow-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>تاریخ</TH>
                    <TH>سند</TH>
                    <TH>شرح</TH>
                    <TH>بدهکار</TH>
                    <TH>بستانکار</TH>
                    <TH>مانده</TH>
                  </TR>
                </THead>
                <TBody>
                  {(ledger.data?.rows ?? []).map((r: any, idx: number) => (
                    <TR key={idx}>
                      <TD className="font-mono">{String(r.entryDate).slice(0, 10)}</TD>
                      <TD className="font-mono">{r.entryNumber}</TD>
                      <TD>{r.memo ?? "-"}</TD>
                      <TD className="font-mono">{formatIRR(r.debit)}</TD>
                      <TD className="font-mono">{formatIRR(r.credit)}</TD>
                      <TD className="font-mono">{formatIRR(r.balance)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm opacity-70">یک حساب انتخاب کنید.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تراز آزمایشی (Top 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>کد</TH>
                  <TH>عنوان</TH>
                  <TH>بدهکار</TH>
                  <TH>بستانکار</TH>
                  <TH>مانده</TH>
                </TR>
              </THead>
              <TBody>
                {(trial.data ?? []).slice(0, 50).map((r: any) => (
                  <TR key={r.accountId}>
                    <TD className="font-mono">{r.code}</TD>
                    <TD>{r.nameFa}</TD>
                    <TD className="font-mono">{formatIRR(r.debit)}</TD>
                    <TD className="font-mono">{formatIRR(r.credit)}</TD>
                    <TD className="font-mono">{formatIRR(r.balance)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
