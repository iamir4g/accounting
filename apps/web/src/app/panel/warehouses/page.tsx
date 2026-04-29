"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Warehouse = { id: string; nameFa: string; address?: string | null };

export default function WarehousesPage() {
  const list = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await api.get("/warehouses")).data as Warehouse[],
  });

  const [nameFa, setNameFa] = useState("");
  const [address, setAddress] = useState("");

  const create = useMutation({
    mutationFn: async () => (await api.post("/warehouses", { nameFa, address: address || undefined })).data,
    onSuccess: () => {
      setNameFa("");
      setAddress("");
      list.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">انبارها</h1>

      <Card>
        <CardHeader>
          <CardTitle>ثبت انبار</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="text-sm">نام</div>
            <Input value={nameFa} onChange={(e) => setNameFa(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">آدرس (اختیاری)</div>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Button onClick={() => create.mutate()} disabled={create.isPending || !nameFa}>
              {create.isPending ? "در حال ثبت..." : "ثبت انبار"}
            </Button>
            {create.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت انبار.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست انبارها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>نام</TH>
                  <TH>آدرس</TH>
                </TR>
              </THead>
              <TBody>
                {(list.data ?? []).map((w) => (
                  <TR key={w.id}>
                    <TD>{w.nameFa}</TD>
                    <TD>{w.address ?? "-"}</TD>
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

