"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { persistAccessToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeMe123!");

  const login = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/login", { email, password });
      return res.data as { accessToken: string };
    },
    onSuccess: (data) => {
      persistAccessToken(data.accessToken);
      const next =
        typeof window === "undefined"
          ? "/tenants"
          : new URLSearchParams(window.location.search).get("next") || "/tenants";
      router.replace(next);
      router.refresh();
    },
  });

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ورود</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm">ایمیل</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">رمز عبور</div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" onClick={() => login.mutate()} disabled={login.isPending}>
            {login.isPending ? "در حال ورود..." : "ورود"}
          </Button>
          {login.isError ? (
            <div className="text-sm text-red-600">ورود ناموفق بود. API را بررسی کنید.</div>
          ) : null}
          <div className="text-xs opacity-70">
            نکته: ابتدا در API کاربر ثبت‌نام کنید: <code>/api/v1/auth/register</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
