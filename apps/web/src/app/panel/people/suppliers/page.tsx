"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

type Supplier = { id: string; name: string; phone?: string | null; email?: string | null; createdAt: string };

export default function SuppliersPage() {
  const list = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => (await api.get("/suppliers")).data as Supplier[],
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const create = useMutation({
    mutationFn: async () => (await api.post("/suppliers", { name, phone: phone || undefined, email: email || undefined })).data,
    onSuccess: () => {
      setName("");
      setPhone("");
      setEmail("");
      list.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">تأمین‌کننده‌ها</h1>

      <Card>
        <CardHeader>
          <CardTitle>ثبت تأمین‌کننده</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">نام</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام تامین‌کننده" />
          </div>
          <div className="space-y-1">
            <div className="text-sm">تلفن</div>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09..." />
          </div>
          <div className="space-y-1">
            <div className="text-sm">ایمیل</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@..." />
          </div>
          <div className="md:col-span-4">
            <Button onClick={() => create.mutate()} disabled={create.isPending || !name}>
              {create.isPending ? "در حال ثبت..." : "ثبت"}
            </Button>
            {create.isError ? <div className="text-sm text-red-600 mt-2">خطا در ثبت تامین‌کننده.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست تأمین‌کننده‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>نام</TH>
                  <TH>تلفن</TH>
                  <TH>ایمیل</TH>
                </TR>
              </THead>
              <TBody>
                {(list.data ?? []).map((s) => (
                  <TR key={s.id}>
                    <TD>{s.name}</TD>
                    <TD className="font-mono">{s.phone ?? "-"}</TD>
                    <TD className="font-mono">{s.email ?? "-"}</TD>
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

