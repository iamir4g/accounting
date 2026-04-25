"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearAccessToken } from "@/lib/auth";

type MyTenant = { tenantId: string; tenantName: string; tenantSlug: string; roleKey: string };

export default function TenantsPage() {
  const router = useRouter();
  const [name, setName] = useState("شرکت نمونه");
  const [slug, setSlug] = useState("sample");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const mine = useQuery({
    queryKey: ["tenants", "mine"],
    queryFn: async () => {
      const res = await api.get("/tenants/mine");
      return res.data as MyTenant[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post("/tenants", { name, slug });
      return res.data;
    },
    onSuccess: () => mine.refetch(),
  });

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      clearAccessToken();
      router.replace("/login");
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">شرکت‌ها (Multi-Tenant)</h1>
        <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "در حال خروج..." : "خروج"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ایجاد شرکت جدید</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="text-sm">نام</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Slug (لاتین)</div>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending ? "در حال ایجاد..." : "ایجاد"}
            </Button>
          </div>
          {create.isError ? (
            <div className="md:col-span-3 text-sm text-red-600">خطا در ایجاد شرکت. لاگ API را ببینید.</div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>شرکت‌های من</CardTitle>
        </CardHeader>
        <CardContent>
          {mine.isLoading ? (
            <div>در حال بارگذاری...</div>
          ) : mine.isError ? (
            <div className="text-red-600">عدم دسترسی. ابتدا وارد شوید.</div>
          ) : mine.data?.length ? (
            <div className="space-y-2">
              {mine.data.map((t) => (
                <div key={t.tenantId} className="flex items-center justify-between border border-border rounded-md p-3">
                  <div>
                    <div className="font-medium">{t.tenantName}</div>
                    <div className="text-xs opacity-70">{t.tenantSlug} — Role: {t.roleKey}</div>
                    <div className="text-xs opacity-70">TenantId برای هدر x-tenant-id: {t.tenantId}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>هنوز شرکتی ندارید.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
