# API Endpoints Specification

This document defines the RESTful API endpoints that the ASP.NET backend should implement to support the Simple IT Inventory App frontend.

---

## Base Configuration

- **Base URL**: `{API_BASE_URL}/api`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... }
}
```

### Paginated Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

---

## Assets API

### GET /assets

Retrieve paginated list of assets with filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 10) |
| `category` | string | Filter by asset category |
| `state` | string | Filter by asset state |
| `employee` | string | Filter by assigned employee |
| `location` | string | Filter by location |
| `search` | string | Search across multiple fields |

**Response:** `PaginatedResponse<Asset>`

---

### GET /assets/:id

Retrieve a single asset by ID.

**Response:** `Asset`

---

### GET /assets/by-service-tag/:serviceTag

Retrieve an asset by its service tag.

**Response:** `Asset | null`

---

### GET /assets/search

Lightweight search for autocomplete (returns max 10 results).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search query |

**Response:** `Asset[]`

---

### POST /assets

Create a new asset.

**Request Body:**

```json
{
  "category": "Laptop",
  "state": "NEW",
  "warrantyexpiry": "2025-12-31",
  "make": "Dell",
  "model": "Vostro 3520",
  "cpu": "i5-1235U",
  "ram": "16GB",
  "storage": "512GB nvme",
  "dedicatedgpu": "N/A",
  "usb-aports": "3",
  "usb-cports": "1",
  "servicetag": "ABC123",
  "employee": "John Doe",
  "additionalcomments": "",
  "location": "Office",
  "dimensions": "N/A",
  "resolution": "N/A",
  "refreshhertz": "N/A"
}
```

**Response:** `Asset` (with generated ID)

---

### PUT /assets/:id

Update an existing asset.

**Request Body:** `Partial<Asset>` (any subset of asset fields)

**Response:** `Asset`

---

### DELETE /assets/:id

Delete an asset.

**Response:**

```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

### POST /assets/import

Bulk import assets from CSV.

**Request:** `multipart/form-data` with file field

**Response:**

```json
{
  "success": true,
  "imported": 50,
  "failed": 2,
  "errors": [
    { "row": 15, "message": "Invalid category" },
    { "row": 32, "message": "Missing service tag" }
  ]
}
```

---

### GET /assets/export

Export assets to CSV.

**Query Parameters:** Same as GET /assets

**Response:** `text/csv` file blob

---

### GET /assets/stats

Get inventory statistics.

**Response:**

```json
{
  "totalAssets": {
    "count": 250,
    "assigned": 180,
    "inStock": 70
  },
  "byCategory": {
    "Laptop": 100,
    "Monitor": 80,
    "Docking": 30,
    "Headset": 40
  },
  "byState": {
    "GOOD": 200,
    "NEW": 30,
    "FAIR": 15,
    "BROKEN": 5
  }
}
```

---

## Employees API

### GET /employees

Retrieve paginated list of employees.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `department` | string | Filter by department |
| `search` | string | Search name, email, department |

**Response:** `PaginatedResponse<Employee>`

---

### GET /employees/:id

Retrieve a single employee.

**Response:** `Employee`

---

### POST /employees

Create a new employee.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "jdoe@company.com",
  "department": "Engineering",
  "position": "Developer"
}
```

**Response:** `Employee`

---

### PUT /employees/:id

Update an employee.

**Request Body:** `Partial<Employee>`

**Response:** `Employee`

---

### DELETE /employees/:id

Delete an employee.

**Response:**

```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## Maintenance API

### GET /maintenance

Retrieve paginated maintenance records.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `status` | string | Filter by status (pending, in-progress, completed, cancelled) |
| `category` | string | Filter by category (hardware, software, network, preventive) |
| `priority` | string | Filter by priority |
| `search` | string | Search asset tag, issue, technician |

**Response:** `PaginatedResponse<MaintenanceRecord>`

---

### GET /maintenance/:id

Retrieve a single maintenance record.

**Response:** `MaintenanceRecord`

---

### POST /maintenance

Create a new maintenance request.

**Request Body:**

```json
{
  "assetTag": "ABC123",
  "assetCategory": "Laptop",
  "assetMake": "Dell",
  "assetModel": "Vostro 3520",
  "issue": "Screen flickering",
  "description": "Display shows intermittent flickering",
  "category": "hardware",
  "priority": "high",
  "technician": "Alex Doe",
  "reportedBy": "Jane Smith",
  "scheduledDate": "2024-12-20",
  "estimatedCost": 150
}
```

**Response:** `MaintenanceRecord`

---

### PUT /maintenance/:id

Update a maintenance record.

**Request Body:** `Partial<MaintenanceRecord>`

**Response:** `MaintenanceRecord`

---

### PATCH /maintenance/:id/status

Update maintenance ticket status.

**Request Body:**

```json
{
  "status": "in-progress",
  "note": "Started diagnosis"
}
```

**Response:** `MaintenanceRecord`

---

### POST /maintenance/:id/comments

Add a comment to a maintenance record.

**Request Body:**

```json
{
  "content": "Ordered replacement part",
  "isInternal": false
}
```

**Response:** `MaintenanceComment`

---

### GET /maintenance/asset/:assetTag

Get maintenance history for a specific asset.

**Response:** `MaintenanceRecord[]`

---

## Models API

### GET /models

Retrieve paginated hardware models.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `category` | string | Filter by category |
| `search` | string | Search name, make |

**Response:** `PaginatedResponse<Model>`

---

### GET /models/:id

Retrieve a single model.

**Response:** `Model`

---

### POST /models

Create a new hardware model.

**Request Body:**

```json
{
  "name": "Vostro 3520",
  "category": "Laptop",
  "make": "Dell",
  "cpu": "i5-1235U",
  "ram": "16GB",
  "storage": "512GB nvme",
  "dedicatedgpu": "N/A",
  "usb-aports": "3",
  "usb-cports": "1",
  "dimensions": "N/A",
  "resolution": "N/A",
  "refreshhertz": "N/A"
}
```

**Response:** `Model`

---

### PUT /models/:id

Update a model.

**Request Body:** `Partial<Model>`

**Response:** `Model`

---

### DELETE /models/:id

Delete a model.

**Response:**

```json
{
  "success": true
}
```

---

## Dashboard API

### GET /dashboard/stats

Get aggregated dashboard statistics.

**Response:**

```json
{
  "totalAssets": {
    "count": 250,
    "assigned": 180,
    "inStock": 70
  },
  "deployment": {
    "count": 180,
    "percentage": 72
  },
  "stock": {
    "count": 70,
    "ready": 65
  },
  "maintenance": {
    "count": 20,
    "pending": 5,
    "inProgress": 8,
    "completed": 7
  }
}
```

---

### GET /dashboard/chart-data

Get time-series data for charts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date (ISO format) |
| `endDate` | string | End date (ISO format) |

**Response:**

```json
[
  { "date": "2024-04-01", "laptop": 120, "monitor": 80, "peripheral": 45 },
  { "date": "2024-04-02", "laptop": 125, "monitor": 82, "peripheral": 47 }
]
```

---

### GET /dashboard/activities

Get recent activity log.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max number of activities (default: 15) |

**Response:** `Activity[]`

---

### POST /dashboard/activities

Log a new activity.

**Request Body:**

```json
{
  "action": "assigned to",
  "target": "MacBook Pro 16",
  "comment": "New hire setup"
}
```

**Response:** `Activity`

---

## Technicians API

### GET /technicians

Get list of available technicians.

**Response:**

```json
[
  { "id": "T001", "name": "Alex Tech", "specialty": "Hardware" },
  { "id": "T002", "name": "Sarah Repair", "specialty": "Software" }
]
```

---

## Authentication (Future)

### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expires_in": 3600
}
```

---

### POST /auth/refresh

Refresh access token.

**Request Body:**

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

**Response:** Same as login

---

### POST /auth/logout

Invalidate current session.

**Response:**

```json
{
  "success": true
}
```

---

## HTTP Status Codes

| Code | Description                     |
| ---- | ------------------------------- |
| 200  | Success                         |
| 201  | Created                         |
| 400  | Bad Request (validation errors) |
| 401  | Unauthorized                    |
| 403  | Forbidden                       |
| 404  | Not Found                       |
| 409  | Conflict (duplicate entry)      |
| 500  | Internal Server Error           |
