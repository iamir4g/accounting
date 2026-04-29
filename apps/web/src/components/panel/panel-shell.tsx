"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearAccessToken } from "@/lib/auth";

export function PanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // محافظت ساده: اگر توکن نیست برو لاگین
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.replace("/login");
  }, [router]);

  const activeTenant = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("tenantId");
  }, []);

  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      clearAccessToken();
      localStorage.removeItem("tenantId");
      router.replace("/login");
      router.refresh();
    }
  }

  const Sidebar = (
    <aside className="h-full w-64 border-l border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="font-semibold">پنل حسابداری</div>
        <div className="text-xs opacity-70 mt-1">
          Tenant: {activeTenant ? activeTenant.slice(0, 8) + "…" : "انتخاب نشده"}
        </div>
      </div>
      <nav className="p-2 flex-1 overflow-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted",
                isActive && "bg-muted font-medium"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Button variant="outline" className="w-full" onClick={logout}>
          خروج
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex-1 min-h-[calc(100vh-0px)] flex">
      {/* Desktop sidebar (با media query تا روی هر تنظیمی نمایش درست باشد) */}
      <div className="panel-sidebar-desktop">{Sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 bottom-0 right-0 w-72 max-w-[85vw]">{Sidebar}</div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
          <Button variant="outline" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>
          <div className="text-sm opacity-80">IRR • RTL • Jalali-ready</div>
          <Link className="text-sm underline" href="/tenants">
            انتخاب/مدیریت شرکت
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-muted/30">{children}</main>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          .panel-sidebar-desktop {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
