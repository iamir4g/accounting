# Implementation Roadmap (SaaS‑ready)

## Phase 0 — Repo & Infra (done in scaffold)
- Monorepo (pnpm + Turbo)
- Docker Compose (postgres, redis, api, web)
- API v1 skeleton + validation + throttling
- Multi‑tenant: database-per-tenant provisioning

## Phase 1 — Foundation (MVP)
**Goal:** a usable Iranian accounting + inventory MVP for one company, with SaaS-ready boundaries.

1. Auth/RBAC hardening
   - Refresh tokens
   - Password reset
   - Permission admin UI
2. Suppliers module
3. Inventory
   - Warehouses
   - Stock transactions (IN/OUT/ADJUST/TRANSFER)
   - Stock valuation method (FIFO/AVG – pick one)
4. Sales/Purchase invoices
   - Numbering per tenant
   - VAT/discount rules
   - Status handling + payments
5. Accounting postings
   - Auto journal entries for invoices + payments
   - Basic chart of accounts seeding for Iran
6. Reports MVP
   - Trial balance
   - P&L
   - Balance sheet

## Phase 2 — Dashboards & Export
- Dashboard KPIs (today sales, inventory value, top products)
- PDF invoice export (server-side rendering)
- CSV exports for reports
- Background jobs for heavy reports (BullMQ)

## Phase 3 — WooCommerce Integration
- WP plugin (webhooks + HMAC)
- API receiver + job queue
- Idempotency + reconciliation tools

## Phase 4 — SaaS & Ops
- Tenant lifecycle
  - plans/billing placeholders
  - tenant suspension
  - per-tenant backup/restore
- Observability
  - structured logs
  - tracing/metrics
- K8s manifests + migration jobs

