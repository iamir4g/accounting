"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Account = { id: string; code: string; nameFa: string };

export default function PaymentsPage() {
  const accounts = useQuery({
    queryKey: ["accounting", "accounts"],
    queryFn: async () => (await api.get("/accounting/accounts")).data as Account[],
  });
  const salesInvoices = useQuery({
    queryKey: ["sales", "invoices"],
    queryFn: async () => (await api.get("/sales/invoices")).data as any[],
  });
  const purchaseInvoices = useQuery({
    queryKey: ["purchases", "invoices"],
    queryFn: async () => (await api.get("/purchases/invoices")).data as any[],
  });
  const payments = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await api.get("/payments")).data as any[],
  });

  const [direction, setDirection] = useState<"IN" | "OUT" | "TRANSFER">("IN");
  const [method, setMethod] = useState("bank_transfer");
  const [amount, setAmount] = useState("0");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [referenceType, setReferenceType] = useState<"" | "SalesInvoice" | "PurchaseInvoice">("");
  const [referenceId, setReferenceId] = useState("");

  const invoiceOptions = useMemo(() => {
    if (referenceType === "SalesInvoice") return salesInvoices.data ?? [];
    if (referenceType === "PurchaseInvoice") return purchaseInvoices.data ?? [];
    return [];
  }, [referenceType, salesInvoices.data, purchaseInvoices.data]);

  const create = useMutation({
    mutationFn: async () =>
      (
        await api.post("/payments", {
          direction,
          method,
          amount: Number(amount),
          fromAccountId: fromAccountId || undefined,
          toAccountId: toAccountId || undefined,
          referenceType: referenceType || undefined,
          referenceId: referenceId || undefined,
        })
      ).data,
    onSuccess: () => {
      payments.refetch();
      salesInvoices.refetch();
      purchaseInvoices.refetch();
      setAmount("0");
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">پرداخت‌ها</h1>

      <Card>
        <CardHeader>
          <CardTitle>ثبت پرداخت/دریافت</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="space-y-1">
            <div className="text-sm">نوع</div>
            <Select value={direction} onChange={(e) => setDirection(e.target.value as any)}>
              <option value="IN">دریافت (IN)</option>
              <option value="OUT">پرداخت (OUT)</option>
              <option value="TRANSFER">انتقال (TRANSFER)</option>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">روش</div>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">نقد</option>
              <option value="bank_transfer">انتقال بانکی</option>
              <option value="pos">POS</option>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">مبلغ</div>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">از حساب</div>
            <Select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
              <option value="">پیش‌فرض</option>
              {(accounts.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">به حساب</div>
            <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
              <option value="">پیش‌فرض</option>
              {(accounts.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">مرجع</div>
            <Select
              value={referenceType}
              onChange={(e) => {
                setReferenceType(e.target.value as any);
                setReferenceId("");
              }}
            >
              <option value="">بدون مرجع</option>
              <option value="SalesInvoice">فاکتور فروش</option>
              <option value="PurchaseInvoice">فاکتور خرید</option>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <div className="text-sm">انتخاب فاکتور</div>
            <Select value={referenceId} onChange={(e) => setReferenceId(e.target.value)} disabled={!referenceType}>
              <option value="">-</option>
              {invoiceOptions.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.number} ({Number(inv.total).toLocaleString("fa-IR")})
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-6">
            <Button onClick={() => create.mutate()} disabled={create.isPending || Number(amount) <= 0}>
              {create.isPending ? "در حال ثبت..." : "ثبت"}
            </Button>
            {create.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت پرداخت.</div> : null}
            <div className="text-xs opacity-70 mt-2">
              نکته: ثبت پرداخت باعث ایجاد سند حسابداری و بروزرسانی وضعیت فاکتور (Paid/Partially/Unpaid) می‌شود.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست پرداخت‌ها (آخرین 200)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>تاریخ</TH>
                  <TH>نوع</TH>
                  <TH>مبلغ</TH>
                  <TH>روش</TH>
                  <TH>مرجع</TH>
                </TR>
              </THead>
              <TBody>
                {(payments.data ?? []).map((p: any) => (
                  <TR key={p.id}>
                    <TD className="font-mono">{String(p.happenedAt).slice(0, 10)}</TD>
                    <TD className="font-mono">{p.direction}</TD>
                    <TD className="font-mono">{Number(p.amount).toLocaleString("fa-IR")}</TD>
                    <TD className="font-mono">{p.method}</TD>
                    <TD className="font-mono">
                      {p.referenceType ? `${p.referenceType}:${String(p.referenceId).slice(0, 6)}…` : "-"}
                    </TD>
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

