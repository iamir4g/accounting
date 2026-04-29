"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Warehouse = { id: string; nameFa: string };
type Product = { id: string; sku: string; nameFa: string };
type StockRow = {
  id: string;
  qty: string;
  avgCost?: string | null;
  product: Product;
  warehouse: Warehouse;
};

export default function InventoryPage() {
  const warehouses = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await api.get("/warehouses")).data as Warehouse[],
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data as any[],
  });

  const [warehouseId, setWarehouseId] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const stock = useQuery({
    queryKey: ["inventory", "stock", warehouseId, onlyLowStock],
    queryFn: async () => {
      const params: any = {};
      if (warehouseId) params.warehouseId = warehouseId;
      if (onlyLowStock) params.lowStock = "true";
      return (await api.get("/inventory/stock", { params })).data as StockRow[];
    },
  });

  const [type, setType] = useState<"IN" | "OUT" | "ADJUST" | "TRANSFER">("IN");
  const [productId, setProductId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [qty, setQty] = useState("1");
  const [unitCost, setUnitCost] = useState("");

  const canUnitCost = type === "IN" || (type === "ADJUST" && !!toWarehouseId);

  const createTxn = useMutation({
    mutationFn: async () =>
      (
        await api.post("/inventory/txns", {
          type,
          productId,
          fromWarehouseId: fromWarehouseId || undefined,
          toWarehouseId: toWarehouseId || undefined,
          qty: Number(qty),
          unitCost: canUnitCost && unitCost ? Number(unitCost) : undefined,
        })
      ).data,
    onSuccess: () => {
      stock.refetch();
      setQty("1");
      setUnitCost("");
    },
  });

  const productOptions = useMemo(() => (products.data ?? []) as any[], [products.data]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">موجودی و تراکنش انبار</h1>

      <Card>
        <CardHeader>
          <CardTitle>ثبت تراکنش موجودی</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="space-y-1">
            <div className="text-sm">نوع</div>
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="IN">ورود (IN)</option>
              <option value="OUT">خروج (OUT)</option>
              <option value="ADJUST">تعدیل (ADJUST)</option>
              <option value="TRANSFER">انتقال (TRANSFER)</option>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">کالا</div>
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">انتخاب کنید</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">از انبار</div>
            <Select value={fromWarehouseId} onChange={(e) => setFromWarehouseId(e.target.value)}>
              <option value="">-</option>
              {(warehouses.data ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">به انبار</div>
            <Select value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)}>
              <option value="">-</option>
              {(warehouses.data ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">تعداد</div>
            <Input value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">بهای واحد (اختیاری)</div>
            <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} disabled={!canUnitCost} />
          </div>
          <div className="md:col-span-6">
            <Button onClick={() => createTxn.mutate()} disabled={createTxn.isPending || !productId}>
              {createTxn.isPending ? "در حال ثبت..." : "ثبت تراکنش"}
            </Button>
            {createTxn.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت تراکنش.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>موجودی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-64">
              <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">همه انبارها</option>
                {(warehouses.data ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nameFa}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant={onlyLowStock ? "default" : "outline"} onClick={() => setOnlyLowStock((x) => !x)}>
              {onlyLowStock ? "نمایش همه" : "فقط کمبود"}
            </Button>
          </div>

          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>کالا</TH>
                  <TH>انبار</TH>
                  <TH>تعداد</TH>
                  <TH>AVG Cost</TH>
                  <TH>ارزش</TH>
                </TR>
              </THead>
              <TBody>
                {(stock.data ?? []).map((r) => {
                  const q = Number(r.qty);
                  const c = Number(r.avgCost ?? 0);
                  return (
                    <TR key={r.id}>
                      <TD>
                        {r.product.sku} - {r.product.nameFa}
                      </TD>
                      <TD>{r.warehouse.nameFa}</TD>
                      <TD className="font-mono">{q.toLocaleString("fa-IR")}</TD>
                      <TD className="font-mono">{c.toLocaleString("fa-IR")}</TD>
                      <TD className="font-mono">{(q * c).toLocaleString("fa-IR")}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

