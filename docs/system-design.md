# System Design (Iran Accounting + Inventory ERP)

## 1) High-Level Architecture

**Monorepo**
- `apps/api`: NestJS REST API (`/api/v1`)
- `apps/web`: Next.js admin panel (RTL, Persian)
- `packages/*`: shared types/contracts (planned)

**Runtime components (Docker Compose / Kubernetes-ready)**
- **web** (Next.js)
- **api** (NestJS)
- **postgres** (Control DB + Tenant DBs)
- **redis** (queues/caching)

## 2) Multi‑Tenancy: Database per Tenant (Chosen)

We use **two layers**:

### A) Control DB (global)
Holds identity and tenant registry:
- `User` (global account)
- `Tenant` (company record)
- `Membership` (user ↔ tenant with `roleKey`)

### B) Tenant DB (per company)
Each tenant has its own Postgres database:
- Business data (customers, products, invoices, accounting entries, audit logs)
- RBAC data (roles/permissions) seeded per tenant DB

**Request flow**
1. User authenticates via JWT (Control DB user)
2. Client sends `x-tenant-id` header
3. API checks membership in Control DB
4. API routes business operations to the corresponding tenant DB connection

**Pros**
- Strong isolation per company (best for SaaS + compliance)
- Easier backups/restore per tenant

**Cons**
- Operational complexity: migrations, connection pooling, provisioning

## 3) Domain Model (Tenant DB) – Core Tables

### RBAC
- `Permission(key)`
- `Role(key, nameFa)`
- `RolePermission(roleId, permissionId)`

> Membership role is stored in Control DB; permissions are evaluated in tenant DB.

### Customers / Suppliers
- `Customer` (name, phone, email, address, optional nationalId)
- `Supplier` (vendor profile)

### Products / Warehouses / Inventory
- `Unit` (piece/kg/box…)
- `Product` (sku, nameFa, unitId, pricing, taxRate, minStock)
- `Warehouse`
- `StockItem` (productId + warehouseId → qty)
- `InventoryTxn` (IN/OUT/ADJUST/TRANSFER, qty, unitCost, references)

### Sales / Purchases
- `SalesInvoice` + `SalesItem`
- `PurchaseInvoice` + `PurchaseItem`

### Accounting (Double-entry baseline)
- `Account` (chart of accounts, hierarchical)
- `JournalEntry` + `JournalLine` (debit/credit)

### Payments & Audit
- `Payment` (IN/OUT/TRANSFER, method, amount, references)
- `AuditLog` (actor, action, entityType/entityId, diff JSON)

## 4) Accounting Approach (Practical Double Entry)

Recommended baseline posting rules:
- **Sales invoice**:
  - Debit: Accounts Receivable / Cash
  - Credit: Revenue
  - Credit: Tax Payable (if VAT enabled)
- **Purchase invoice**:
  - Debit: Inventory / Expense
  - Credit: Accounts Payable / Cash
- **Payments**:
  - Reduce AR/AP or move between cash/bank accounts

Implementation detail:
- Each invoice/payment should create a `JournalEntry` with `sourceType/sourceId`
- Reports (TB, P&L, Balance Sheet) computed from journal lines grouped by account type and date

## 5) Localization (Iran)

- Default currency: **IRR**
- UI: **RTL**, Persian copy
- Date: **Jalali** (planned across UI + reporting filters)

## 6) Security & Compliance

- JWT auth (Bearer token)
- Tenant enforcement via `x-tenant-id` + membership validation (Control DB)
- RBAC permissions per endpoint (`RequirePermissions(...)`)
- Rate limiting (Nest Throttler) – enabled
- Input validation using DTOs + global ValidationPipe – enabled
- Audit logging for financial mutations – schema ready, hooks planned

## 7) WooCommerce Integration (Planned)

Recommended architecture:
- WooCommerce → **webhook** to WP plugin endpoint
- Plugin signs payload (HMAC) → calls NestJS `/api/v1/integrations/woocommerce/webhook`
- NestJS enqueues job in **BullMQ** (Redis) for idempotent processing
- Job syncs:
  - Products → `Product`
  - Orders → `SalesInvoice` + stock OUT + journal entries

Alternative: scheduled sync (cron/queues) for reconciliation.

## 8) Cloud/Kubernetes Readiness

Current: Docker Compose for dev.

Future K8s:
- `api` and `web` as Deployments
- `postgres` managed service (Cloud SQL / RDS)
- `redis` managed service
- Secrets via K8s Secrets / Vault
- Migrations as Job (per tenant provisioning service + controlled rollout)

