"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIRR } from "@/lib/format";

export default function DashboardPage() {
  const profitLoss = useQuery({
    queryKey: ["reports", "profit-loss"],
    queryFn: async () => (await api.get("/reports/profit-loss")).data as { revenue: number; expense: number; netProfit: number },
  });

  const invVal = useQuery({
    queryKey: ["reports", "inventory-valuation"],
    queryFn: async () => (await api.get("/reports/inventory-valuation")).data as { totalValue: number },
  });

  const data = [
    { name: "فروش", value: profitLoss.data?.revenue ?? 0 },
    { name: "هزینه", value: profitLoss.data?.expense ?? 0 },
    { name: "سود", value: profitLoss.data?.netProfit ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">داشبورد</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/panel/sales/invoices">فاکتور فروش</Link>
          </Button>
          <Button asChild>
            <Link href="/panel/purchases/invoices">فاکتور خرید</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ارزش موجودی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {invVal.isLoading ? "..." : formatIRR(invVal.data?.totalValue ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>درآمد (P&L)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {profitLoss.isLoading ? "..." : formatIRR(profitLoss.data?.revenue ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>هزینه (P&L)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {profitLoss.isLoading ? "..." : formatIRR(profitLoss.data?.expense ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>سود خالص</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {profitLoss.isLoading ? "..." : formatIRR(profitLoss.data?.netProfit ?? 0)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>خلاصه مالی (نمونه)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => formatIRR(Number(v))} />
              <Tooltip formatter={(v: any) => formatIRR(Number(v))} />
              <Bar dataKey="value" fill="var(--foreground)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
