# API Design (v1)

Base path: `/api/v1`

## Auth (Control DB)
- `POST /auth/register` – create global user
- `POST /auth/login` – returns `{ accessToken }`
- `GET /auth/me` – current user (JWT)

## Tenants (Control DB)
- `GET /tenants/mine` – list tenants that the current user belongs to
- `POST /tenants` – create tenant + provision tenant database + seed RBAC/units/warehouse

## Customers (Tenant DB)
Requires:
- JWT
- `x-tenant-id`
- permission guards

Endpoints:
- `GET /customers` – `customers:read`
- `POST /customers` – `customers:write`
- `GET /customers/:id` – `customers:read`
- `PATCH /customers/:id` – `customers:write`
- `DELETE /customers/:id` – `customers:write`

## Products (Tenant DB)
Requires:
- JWT
- `x-tenant-id`
- permission guards

Endpoints:
- `GET /products` – `products:read`
- `POST /products` – `products:write`
- `GET /products/:id` – `products:read`
- `PATCH /products/:id` – `products:write`
- `DELETE /products/:id` – `products:write`

## Planned Endpoints (Next)

### Suppliers
- `GET /suppliers` – `suppliers:read`
- `POST /suppliers` – `suppliers:write`
- `GET /suppliers/:id` – `suppliers:read`
- `PATCH /suppliers/:id` – `suppliers:write`
- `DELETE /suppliers/:id` – `suppliers:write`

### Inventory
- `GET /warehouses` – read
- `POST /warehouses` – `inventory:write`
- `PATCH /warehouses/:id` – `inventory:write`
- `DELETE /warehouses/:id` – `inventory:write`
- `POST /inventory/txns` (IN/OUT/ADJUST/TRANSFER) – `inventory:write`
- `GET /inventory/stock` (current stock, low stock) – `reports:read`

### Sales / Purchases
- `POST /sales/invoices` – `sales:write`
- `GET /sales/invoices` – `sales:read`
- `GET /sales/invoices/:id` – `sales:read`
- `POST /purchases/invoices` – `purchases:write`
- `GET /purchases/invoices` – `purchases:read`
- `GET /purchases/invoices/:id` – `purchases:read`

### Accounting
- `POST /accounting/accounts` – `accounting:write`
- `GET /accounting/accounts` – `accounting:read`
- `POST /accounting/journal-entries` – `accounting:write`
- `GET /accounting/journal-entries` – `accounting:read`
- `GET /accounting/trial-balance` – `reports:read`

### Payments
- `POST /payments` – `accounting:write`
- `GET /payments` – `accounting:read`

### Audit logs
- `GET /audit-logs` – `reports:read`

### Reports
- `GET /reports/profit-loss` – `reports:read`
- `GET /reports/balance-sheet` – `reports:read`
- `GET /reports/inventory-valuation` – `reports:read`
- `GET /reports/ledger?accountId=...` – `reports:read`

### Integrations (WooCommerce)
- `/integrations/woocommerce/webhook` (signed webhook receiver)
- `/integrations/woocommerce/sync` (manual sync trigger)
