"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAccessToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const data = [
    { name: "فروردین", sales: 120_000_000 },
    { name: "اردیبهشت", sales: 155_000_000 },
    { name: "خرداد", sales: 98_000_000 },
    { name: "تیر", sales: 210_000_000 },
  ];

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
    <div className="flex flex-col flex-1 p-6 gap-6 max-w-6xl mx-auto w-full">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">داشبورد</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/tenants">ایجاد شرکت</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "در حال خروج..." : "خروج"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>فروش امروز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">۱۲٬۵۰۰٬۰۰۰</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>درآمد ماه</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">۳۴۵٬۰۰۰٬۰۰۰</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ارزش موجودی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">۸۹۰٬۰۰۰٬۰۰۰</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>هشدار موجودی کم</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">۳</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فروش ماهانه (نمونه)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="var(--foreground)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
