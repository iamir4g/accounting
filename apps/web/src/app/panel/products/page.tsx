"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Unit = { id: string; key: string; nameFa: string };
type Product = { id: string; sku: string; nameFa: string; salePrice: string; purchasePrice: string; unitId: string; unit: Unit };

export default function ProductsPage() {
  const units = useQuery({
    queryKey: ["units"],
    queryFn: async () => (await api.get("/inventory/units")).data as Unit[],
  });

  const list = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data as Product[],
  });

  const [sku, setSku] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [unitId, setUnitId] = useState("");
  const [salePrice, setSalePrice] = useState("0");
  const [purchasePrice, setPurchasePrice] = useState("0");

  const create = useMutation({
    mutationFn: async () =>
      (
        await api.post("/products", {
          sku,
          nameFa,
          unitId,
          salePrice: Number(salePrice),
          purchasePrice: Number(purchasePrice),
        })
      ).data,
    onSuccess: () => {
      setSku("");
      setNameFa("");
      setSalePrice("0");
      setPurchasePrice("0");
      list.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">کالاها</h1>

      <Card>
        <CardHeader>
          <CardTitle>ثبت کالا</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <div className="text-sm">SKU</div>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">نام</div>
            <Input value={nameFa} onChange={(e) => setNameFa(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">واحد</div>
            <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">انتخاب کنید</option>
              {(units.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nameFa}
                </option>
              ))}
            </Select>
            <div className="text-xs opacity-70">واحدها در زمان ساخت شرکت seed می‌شوند.</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm">قیمت فروش</div>
            <Input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">قیمت خرید</div>
            <Input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          </div>
          <div className="md:col-span-5">
            <Button onClick={() => create.mutate()} disabled={create.isPending || !sku || !nameFa || !unitId}>
              {create.isPending ? "در حال ثبت..." : "ثبت کالا"}
            </Button>
            {create.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت کالا.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست کالاها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>نام</TH>
                  <TH>واحد</TH>
                  <TH>فروش</TH>
                  <TH>خرید</TH>
                </TR>
              </THead>
              <TBody>
                {(list.data ?? []).map((p) => (
                  <TR key={p.id}>
                    <TD className="font-mono">{p.sku}</TD>
                    <TD>{p.nameFa}</TD>
                    <TD>{p.unit?.nameFa ?? "-"}</TD>
                    <TD className="font-mono">{Number(p.salePrice).toLocaleString("fa-IR")}</TD>
                    <TD className="font-mono">{Number(p.purchasePrice).toLocaleString("fa-IR")}</TD>
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
