---
title: API Specifications
description: Summary of REST API endpoints and contracts
tags: [api, backend]
---

# API Specifications

See full specification in `docs/API_ENDPOINTS.md`.

## Key Endpoints

### Assets

- `GET /assets` (Paginated, filtered)
- `POST /assets` (Create)
- `PUT /assets/:id` (Update)
- `GET /assets/stats` (Inventory statistics)

### Employees

- `GET /employees`
- `POST /employees`
- `GET /employees/:id`

### Maintenance

- `GET /maintenance`
- `POST /maintenance`
- `PATCH /maintenance/:id/status` (Workflow transitions)

### Models

- `GET /models`
- `POST /models`

### Dashboard

- `GET /dashboard/stats` (KPIs)
- `GET /dashboard/chart-data` (Timeline)
- `GET /dashboard/activities` (Audit log)
