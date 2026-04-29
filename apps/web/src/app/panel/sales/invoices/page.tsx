"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Warehouse = { id: string; nameFa: string };
type Customer = { id: string; name: string };
type Product = { id: string; sku: string; nameFa: string; salePrice: string };

export default function SalesInvoicesPage() {
  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get("/customers")).data as Customer[],
  });
  const warehouses = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await api.get("/warehouses")).data as Warehouse[],
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data as any[],
  });

  const list = useQuery({
    queryKey: ["sales", "invoices"],
    queryFn: async () => (await api.get("/sales/invoices")).data as any[],
  });

  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  const create = useMutation({
    mutationFn: async () =>
      (
        await api.post("/sales/invoices", {
          customerId,
          warehouseId,
          items: [{ productId, qty: Number(qty), unitPrice: Number(unitPrice || 0) }],
        })
      ).data,
    onSuccess: () => {
      list.refetch();
      setQty("1");
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">فاکتور فروش</h1>

      <Card>
        <CardHeader>
          <CardTitle>ثبت فاکتور فروش (ساده)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">مشتری</div>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">انتخاب کنید</option>
              {(customers.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">انبار</div>
            <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="">انتخاب کنید</option>
              {(warehouses.data ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">کالا</div>
            <Select
              value={productId}
              onChange={(e) => {
                const id = e.target.value;
                setProductId(id);
                const p = (products.data ?? []).find((x: any) => x.id === id);
                if (p?.salePrice != null) setUnitPrice(String(p.salePrice));
              }}
            >
              <option value="">انتخاب کنید</option>
              {(products.data ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">تعداد</div>
            <Input value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">قیمت واحد</div>
            <Input value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
          <div className="md:col-span-5">
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || !customerId || !warehouseId || !productId}
            >
              {create.isPending ? "در حال ثبت..." : "ثبت فاکتور"}
            </Button>
            {create.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت فاکتور.</div> : null}
            <div className="text-xs opacity-70 mt-2">
              نسخه حرفه‌ای: چند آیتم، تخفیف/مالیات، چاپ/PDF، پرداخت و… (قابل توسعه)
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست فاکتورها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>شماره</TH>
                  <TH>مشتری</TH>
                  <TH>مبلغ</TH>
                  <TH>وضعیت</TH>
                </TR>
              </THead>
              <TBody>
                {(list.data ?? []).map((inv: any) => (
                  <TR key={inv.id}>
                    <TD className="font-mono">{inv.number}</TD>
                    <TD>{inv.customer?.name ?? "-"}</TD>
                    <TD className="font-mono">{Number(inv.total).toLocaleString("fa-IR")}</TD>
                    <TD className="font-mono">{inv.status}</TD>
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

