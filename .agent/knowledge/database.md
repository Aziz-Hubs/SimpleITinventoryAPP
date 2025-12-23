---
title: Database Schema
description: Entity relationships, columns, and database design principles
tags: [database, schema]
---

# Database Schema

See full specification in `docs/DATABASE_SCHEMA.md`.

## Schema Highlights

- **Multi-Tenancy**: All tables include `TenantId`.
- **Auditing**: All tables include `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`.
- **Concurrency**: Optimistic locking via `RowVersion`.

## Main Entities

- **Asset**: The core item being tracked. Links to Model, Employee, and Location.
- **Model**: Hardware template (Specs, Make, Category).
- **Employee**: Personnel who can be assigned assets.
- **MaintenanceRecord**: History of repairs on an Asset.
- **Invoice**: Financial record of procurement.
- **InvoiceLineItem**: Connects Invoices to Assets (bulk purchase tracking).
- **ActivityLog**: System-wide audit trail.

## Relationships

- `Tenant` owns `Assets`, `Employees`, `Invoices`.
- `Model` defines `Assets`.
- `Employee` has many `Assets` (AssignedTo).
- `Asset` has many `MaintenanceRecords`.
