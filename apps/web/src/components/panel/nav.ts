import {
  Banknote,
  Boxes,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: any;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "داشبورد", href: "/panel/dashboard", icon: LayoutDashboard },
  { label: "اشخاص (مشتریان)", href: "/panel/people/customers", icon: Users },
  { label: "اشخاص (تأمین‌کننده‌ها)", href: "/panel/people/suppliers", icon: Users },
  { label: "کالاها", href: "/panel/products", icon: Package },
  { label: "انبارها", href: "/panel/warehouses", icon: Boxes },
  { label: "موجودی", href: "/panel/inventory", icon: ClipboardList },
  { label: "فروش (فاکتور)", href: "/panel/sales/invoices", icon: FileText },
  { label: "خرید (فاکتور)", href: "/panel/purchases/invoices", icon: FileText },
  { label: "بانک/صندوق و حساب‌ها", href: "/panel/finance/accounts", icon: Banknote },
  { label: "پرداخت‌ها", href: "/panel/finance/payments", icon: Banknote },
  { label: "گزارش‌ها", href: "/panel/reports", icon: ClipboardList },
  { label: "تنظیمات (شرکت)", href: "/tenants", icon: Settings },
];
