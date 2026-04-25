# Iran ERP (Accounting + Inventory) – Monorepo

این ریپو یک اسکلت cloud‑ready برای سیستم حسابداری و انبارداری (سازگار با کسب‌وکارهای ایران) است:

- **Frontend**: Next.js + TypeScript + Tailwind + shadcn/ui (RTL + Persian)
- **Backend**: NestJS (REST `/api/v1`) + JWT + RBAC
- **DB**: PostgreSQL + Prisma
- **Multi‑Tenant**: **Database per tenant** (یک Control DB برای هویت/tenantها + یک Tenant DB جداگانه برای هر شرکت)
- **Infra**: Docker Compose (postgres, redis, api, web)

## اجرا (Local)

1) ساخت فایل env:

```bash
cp .env.example .env
```

2) اجرای Docker:

```bash
pnpm docker:up
```

## پوشه‌ها

- `apps/api` سرویس NestJS
- `apps/web` پنل Next.js
- `packages/shared` تایپ‌ها/اسکیماهای مشترک

## مستندات

- `docs/system-design.md` معماری و مدل چندمستاجری
- `docs/api.md` ساختار APIها
- `docs/roadmap.md` نقشه راه توسعه
- `docs/user-guide-fa.md` راهنمای استفاده برای حسابدار
