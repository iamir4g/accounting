"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Account = { id: string; code: string; nameFa: string; type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"; parentId?: string | null };

export default function AccountsPage() {
  const accounts = useQuery({
    queryKey: ["accounting", "accounts"],
    queryFn: async () => (await api.get("/accounting/accounts")).data as Account[],
  });

  const bankParentId = useMemo(() => accounts.data?.find((a) => a.code === "1200")?.id ?? "", [accounts.data]);
  const cashParentId = useMemo(() => accounts.data?.find((a) => a.code === "1100")?.id ?? "", [accounts.data]);

  const [code, setCode] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [type, setType] = useState<Account["type"]>("ASSET");
  const [parentId, setParentId] = useState<string>("");

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post("/accounting/accounts", {
        code,
        nameFa,
        type,
        parentId: parentId || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setCode("");
      setNameFa("");
      accounts.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">بانک/صندوق و حساب‌ها</h1>

      <Card>
        <CardHeader>
          <CardTitle>تعریف حساب (مثلاً حساب بانکی)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="text-sm">کد</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="مثلاً 1201" />
          </div>
          <div className="space-y-1">
            <div className="text-sm">عنوان</div>
            <Input value={nameFa} onChange={(e) => setNameFa(e.target.value)} placeholder="مثلاً بانک ملی - شعبه ..." />
          </div>
          <div className="space-y-1">
            <div className="text-sm">نوع</div>
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="ASSET">دارایی</option>
              <option value="LIABILITY">بدهی</option>
              <option value="EQUITY">سرمایه</option>
              <option value="REVENUE">درآمد</option>
              <option value="EXPENSE">هزینه</option>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm">حساب کل (Parent)</div>
            <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">بدون parent</option>
              {cashParentId ? <option value={cashParentId}>1100 - صندوق</option> : null}
              {bankParentId ? <option value={bankParentId}>1200 - بانک</option> : null}
              {(accounts.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.nameFa}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-4">
            <Button onClick={() => create.mutate()} disabled={create.isPending || !code || !nameFa}>
              {create.isPending ? "در حال ثبت..." : "ثبت حساب"}
            </Button>
            {create.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت حساب.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست حساب‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>کد</TH>
                  <TH>عنوان</TH>
                  <TH>نوع</TH>
                </TR>
              </THead>
              <TBody>
                {(accounts.data ?? []).map((a) => (
                  <TR key={a.id}>
                    <TD className="font-mono">{a.code}</TD>
                    <TD>{a.nameFa}</TD>
                    <TD>{a.type}</TD>
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

