# Database Schema Specification

This document defines the database schema for the Simple IT Inventory App backend.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Employee    │       │      Asset      │       │      Model      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK: Id          │◄──────│ FK: EmployeeId  │       │ PK: Id          │
│    FullName     │       │ FK: ModelId     │──────►│    Name         │
│    Email        │       │ PK: Id          │       │    Category     │
│    Department   │       │    ServiceTag   │       │    Make         │
│    Position     │       │    Category     │       │    Cpu          │
└─────────────────┘       │    State        │       │    Ram          │
                          │    Location     │       │    Storage      │
                          └────────┬────────┘       └─────────────────┘
                                   │
                                   │
                          ┌────────▼────────┐
                          │  Maintenance    │
                          │     Record      │
                          ├─────────────────┤
                          │ PK: Id          │
                          │ FK: AssetId     │
                          │ FK: TechnicianId│
                          │    Issue        │
                          │    Status       │
                          └────────┬────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
           ┌────────▼────────┐           ┌────────▼────────┐
           │ MaintenanceNote │           │MaintenanceComment│
           └─────────────────┘           └─────────────────┘
```

---

## Tables

### 1. Employees

Stores organizational employee records.

| Column       | Type          | Constraints       | Description                   |
| ------------ | ------------- | ----------------- | ----------------------------- |
| `Id`         | VARCHAR(20)   | PRIMARY KEY       | Employee ID (e.g., "EMP-001") |
| `FullName`   | NVARCHAR(100) | NOT NULL          | Full name (e.g., "Doe, John") |
| `Email`      | VARCHAR(255)  | NOT NULL, UNIQUE  | Email address                 |
| `Department` | NVARCHAR(50)  | NOT NULL          | Department code/name          |
| `Position`   | NVARCHAR(100) | NOT NULL          | Job title                     |
| `CreatedAt`  | DATETIME      | DEFAULT GETDATE() | Record creation timestamp     |
| `UpdatedAt`  | DATETIME      | NULL              | Last modification timestamp   |
| `IsActive`   | BIT           | DEFAULT 1         | Soft delete flag              |

**Indexes:**

- `IX_Employees_Email` (UNIQUE)
- `IX_Employees_Department`
- `IX_Employees_FullName`

---

### 2. Assets

Core inventory table for all IT assets.

| Column               | Type          | Constraints           | Description                         |
| -------------------- | ------------- | --------------------- | ----------------------------------- |
| `Id`                 | INT           | PRIMARY KEY, IDENTITY | Auto-increment ID                   |
| `ServiceTag`         | VARCHAR(50)   | NOT NULL, UNIQUE      | Hardware identifier                 |
| `Category`           | VARCHAR(30)   | NOT NULL              | Asset type (Laptop, Monitor, etc.)  |
| `State`              | VARCHAR(20)   | NOT NULL              | Condition (NEW, GOOD, FAIR, BROKEN) |
| `Make`               | NVARCHAR(50)  | NOT NULL              | Manufacturer                        |
| `Model`              | NVARCHAR(100) | NOT NULL              | Model name                          |
| `WarrantyExpiry`     | DATE          | NULL                  | Warranty end date                   |
| `Cpu`                | VARCHAR(50)   | NULL                  | Processor specification             |
| `Ram`                | VARCHAR(20)   | NULL                  | Memory specification                |
| `Storage`            | VARCHAR(50)   | NULL                  | Storage specification               |
| `DedicatedGpu`       | VARCHAR(50)   | NULL                  | GPU specification                   |
| `UsbAPorts`          | VARCHAR(10)   | NULL                  | USB-A port count                    |
| `UsbCPorts`          | VARCHAR(10)   | NULL                  | USB-C port count                    |
| `Dimensions`         | VARCHAR(30)   | NULL                  | Physical dimensions (monitors)      |
| `Resolution`         | VARCHAR(30)   | NULL                  | Screen resolution (monitors)        |
| `RefreshHertz`       | VARCHAR(20)   | NULL                  | Refresh rate (monitors)             |
| `Location`           | VARCHAR(50)   | NOT NULL              | Physical location                   |
| `EmployeeId`         | VARCHAR(20)   | NULL, FK              | Assigned employee                   |
| `AdditionalComments` | NVARCHAR(500) | NULL                  | Notes                               |
| `ModelId`            | INT           | NULL, FK              | Reference to Models table           |
| `CreatedAt`          | DATETIME      | DEFAULT GETDATE()     | Record creation                     |
| `UpdatedAt`          | DATETIME      | NULL                  | Last modification                   |
| `IsDeleted`          | BIT           | DEFAULT 0             | Soft delete flag                    |

**Indexes:**

- `IX_Assets_ServiceTag` (UNIQUE)
- `IX_Assets_Category`
- `IX_Assets_State`
- `IX_Assets_EmployeeId`
- `IX_Assets_Location`

**Foreign Keys:**

- `FK_Assets_Employees` → Employees(Id)
- `FK_Assets_Models` → Models(Id)

---

### 3. Models

Hardware model templates with default specifications.

| Column         | Type          | Constraints           | Description          |
| -------------- | ------------- | --------------------- | -------------------- |
| `Id`           | INT           | PRIMARY KEY, IDENTITY | Auto-increment ID    |
| `Name`         | NVARCHAR(100) | NOT NULL              | Model name           |
| `Category`     | VARCHAR(30)   | NOT NULL              | Asset category       |
| `Make`         | NVARCHAR(50)  | NOT NULL              | Manufacturer         |
| `Cpu`          | VARCHAR(50)   | NULL                  | Default CPU          |
| `Ram`          | VARCHAR(20)   | NULL                  | Default RAM          |
| `Storage`      | VARCHAR(50)   | NULL                  | Default storage      |
| `DedicatedGpu` | VARCHAR(50)   | NULL                  | Default GPU          |
| `UsbAPorts`    | VARCHAR(10)   | NULL                  | USB-A ports          |
| `UsbCPorts`    | VARCHAR(10)   | NULL                  | USB-C ports          |
| `Dimensions`   | VARCHAR(30)   | NULL                  | Default dimensions   |
| `Resolution`   | VARCHAR(30)   | NULL                  | Default resolution   |
| `RefreshHertz` | VARCHAR(20)   | NULL                  | Default refresh rate |
| `CreatedAt`    | DATETIME      | DEFAULT GETDATE()     | Record creation      |
| `UpdatedAt`    | DATETIME      | NULL                  | Last modification    |

**Indexes:**

- `IX_Models_Name_Make` (Name, Make) UNIQUE
- `IX_Models_Category`

---

### 4. MaintenanceRecords

Tracks maintenance tickets and repairs.

| Column          | Type           | Constraints       | Description                      |
| --------------- | -------------- | ----------------- | -------------------------------- |
| `Id`            | VARCHAR(20)    | PRIMARY KEY       | Ticket ID (e.g., "MNT-001")      |
| `AssetId`       | INT            | NOT NULL, FK      | Referenced asset                 |
| `AssetTag`      | VARCHAR(50)    | NOT NULL          | Asset service tag (denormalized) |
| `AssetCategory` | VARCHAR(30)    | NOT NULL          | Asset category (denormalized)    |
| `AssetMake`     | NVARCHAR(50)   | NULL              | Asset make (denormalized)        |
| `AssetModel`    | NVARCHAR(100)  | NULL              | Asset model (denormalized)       |
| `Issue`         | NVARCHAR(200)  | NOT NULL          | Issue summary                    |
| `Description`   | NVARCHAR(2000) | NOT NULL          | Detailed description             |
| `Category`      | VARCHAR(20)    | NOT NULL          | Maintenance category             |
| `Status`        | VARCHAR(20)    | NOT NULL          | Current status                   |
| `Priority`      | VARCHAR(20)    | NOT NULL          | Priority level                   |
| `TechnicianId`  | VARCHAR(20)    | NULL, FK          | Assigned technician              |
| `ReportedBy`    | NVARCHAR(100)  | NOT NULL          | Person who reported              |
| `ReportedDate`  | DATETIME       | NOT NULL          | When reported                    |
| `ScheduledDate` | DATE           | NULL              | Scheduled work date              |
| `CompletedDate` | DATETIME       | NULL              | When completed                   |
| `EstimatedCost` | DECIMAL(10,2)  | NULL              | Estimated repair cost            |
| `ActualCost`    | DECIMAL(10,2)  | NULL              | Final cost                       |
| `CreatedAt`     | DATETIME       | DEFAULT GETDATE() | Record creation                  |
| `UpdatedAt`     | DATETIME       | NULL              | Last modification                |

**Indexes:**

- `IX_Maintenance_AssetId`
- `IX_Maintenance_Status`
- `IX_Maintenance_Priority`
- `IX_Maintenance_TechnicianId`
- `IX_Maintenance_ReportedDate`

**Foreign Keys:**

- `FK_Maintenance_Assets` → Assets(Id)
- `FK_Maintenance_Technicians` → Technicians(Id)

---

### 5. MaintenanceTimelineEvents

Audit log for maintenance ticket changes.

| Column          | Type          | Constraints  | Description        |
| --------------- | ------------- | ------------ | ------------------ |
| `Id`            | VARCHAR(50)   | PRIMARY KEY  | Event ID           |
| `MaintenanceId` | VARCHAR(20)   | NOT NULL, FK | Parent ticket      |
| `Type`          | VARCHAR(20)   | NOT NULL     | Event type         |
| `Title`         | NVARCHAR(100) | NOT NULL     | Event title        |
| `Description`   | NVARCHAR(500) | NULL         | Event description  |
| `Timestamp`     | DATETIME      | NOT NULL     | When occurred      |
| `UserId`        | NVARCHAR(100) | NOT NULL     | User who triggered |

**Event Types:**

- `creation`
- `status_change`
- `assignment`
- `comment`
- `update`

**Foreign Keys:**

- `FK_TimelineEvents_Maintenance` → MaintenanceRecords(Id) ON DELETE CASCADE

---

### 6. MaintenanceComments

Comments on maintenance tickets.

| Column          | Type           | Constraints  | Description        |
| --------------- | -------------- | ------------ | ------------------ |
| `Id`            | VARCHAR(50)    | PRIMARY KEY  | Comment ID         |
| `MaintenanceId` | VARCHAR(20)    | NOT NULL, FK | Parent ticket      |
| `Author`        | NVARCHAR(100)  | NOT NULL     | Comment author     |
| `Content`       | NVARCHAR(2000) | NOT NULL     | Comment text       |
| `Timestamp`     | DATETIME       | NOT NULL     | When posted        |
| `IsInternal`    | BIT            | DEFAULT 0    | Internal-only flag |

**Foreign Keys:**

- `FK_Comments_Maintenance` → MaintenanceRecords(Id) ON DELETE CASCADE

---

### 7. MaintenanceCosts

Detailed cost breakdown for maintenance.

| Column             | Type          | Constraints           | Description          |
| ------------------ | ------------- | --------------------- | -------------------- |
| `Id`               | INT           | PRIMARY KEY, IDENTITY | Auto-increment ID    |
| `MaintenanceId`    | VARCHAR(20)   | NOT NULL, FK          | Parent ticket        |
| `PartsCost`        | DECIMAL(10,2) | DEFAULT 0             | Parts/materials cost |
| `LaborCost`        | DECIMAL(10,2) | DEFAULT 0             | Labor cost           |
| `Currency`         | CHAR(3)       | DEFAULT 'USD'         | Currency code        |
| `PartsDescription` | NVARCHAR(500) | NULL                  | Parts details        |
| `InvoiceNumber`    | VARCHAR(50)   | NULL                  | Related invoice      |

**Foreign Keys:**

- `FK_Costs_Maintenance` → MaintenanceRecords(Id) ON DELETE CASCADE

---

### 8. Technicians

Available maintenance technicians.

| Column      | Type          | Constraints | Description       |
| ----------- | ------------- | ----------- | ----------------- |
| `Id`        | VARCHAR(20)   | PRIMARY KEY | Technician ID     |
| `Name`      | NVARCHAR(100) | NOT NULL    | Full name         |
| `Specialty` | VARCHAR(50)   | NULL        | Area of expertise |
| `Email`     | VARCHAR(255)  | NULL        | Contact email     |
| `Phone`     | VARCHAR(20)   | NULL        | Contact phone     |
| `IsActive`  | BIT           | DEFAULT 1   | Active status     |

---

### 9. Activities

System activity/audit log.

| Column         | Type          | Constraints           | Description               |
| -------------- | ------------- | --------------------- | ------------------------- |
| `Id`           | INT           | PRIMARY KEY, IDENTITY | Auto-increment ID         |
| `UserName`     | NVARCHAR(100) | NOT NULL              | User who performed action |
| `UserAvatar`   | VARCHAR(255)  | NULL                  | Avatar URL                |
| `UserInitials` | CHAR(3)       | NOT NULL              | Display initials          |
| `Action`       | NVARCHAR(100) | NOT NULL              | Action description        |
| `Target`       | NVARCHAR(200) | NOT NULL              | Affected entity           |
| `Comment`      | NVARCHAR(500) | NULL                  | Additional context        |
| `Timestamp`    | DATETIME      | DEFAULT GETDATE()     | When occurred             |
| `EntityType`   | VARCHAR(50)   | NULL                  | Type of entity affected   |
| `EntityId`     | VARCHAR(50)   | NULL                  | ID of affected entity     |

**Indexes:**

- `IX_Activities_Timestamp`
- `IX_Activities_EntityType_EntityId`

---

## Lookup Tables

### AssetCategories

| Column        | Type         | Constraints |
| ------------- | ------------ | ----------- |
| `Code`        | VARCHAR(30)  | PRIMARY KEY |
| `DisplayName` | NVARCHAR(50) | NOT NULL    |
| `SortOrder`   | INT          | DEFAULT 0   |

**Seed Data:**

```
Laptop, Monitor, Docking, Headset, Desktop, Network Switch,
Firewall, Access Point, 5G/4G Modem, UPS, NVR, Printer, TV
```

---

### AssetStates

| Column        | Type         | Constraints |
| ------------- | ------------ | ----------- |
| `Code`        | VARCHAR(20)  | PRIMARY KEY |
| `DisplayName` | NVARCHAR(30) | NOT NULL    |
| `ColorCode`   | VARCHAR(7)   | NULL        |

**Seed Data:**

```
NEW (#22c55e), GOOD (#3b82f6), FAIR (#f59e0b), BROKEN (#ef4444)
```

---

### AssetLocations

| Column        | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `Code`        | VARCHAR(50)   | PRIMARY KEY |
| `DisplayName` | NVARCHAR(100) | NOT NULL    |

**Seed Data:**

```
Office, Server
```

---

### MaintenanceCategories

| Column        | Type         | Constraints |
| ------------- | ------------ | ----------- |
| `Code`        | VARCHAR(20)  | PRIMARY KEY |
| `DisplayName` | NVARCHAR(50) | NOT NULL    |

**Seed Data:**

```
hardware, software, network, preventive
```

---

### MaintenanceStatuses

| Column        | Type         | Constraints |
| ------------- | ------------ | ----------- |
| `Code`        | VARCHAR(20)  | PRIMARY KEY |
| `DisplayName` | NVARCHAR(50) | NOT NULL    |
| `ColorCode`   | VARCHAR(7)   | NULL        |

**Seed Data:**

```
pending, in-progress, completed, scheduled, cancelled
```

---

### MaintenancePriorities

| Column        | Type         | Constraints |
| ------------- | ------------ | ----------- |
| `Code`        | VARCHAR(20)  | PRIMARY KEY |
| `DisplayName` | NVARCHAR(30) | NOT NULL    |
| `SortOrder`   | INT          | NOT NULL    |

**Seed Data:**

```
critical (1), high (2), medium (3), low (4)
```

---

## Departments

For normalizing employee departments.

| Column        | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `Code`        | VARCHAR(10)   | PRIMARY KEY |
| `DisplayName` | NVARCHAR(100) | NOT NULL    |

**Seed Data:**

```
VND, RES, ISM, NOC, FIN, MKT, GCO, FSO, ENG, HRM, ITM, IMP
```

---

## Recommended Database: SQL Server

- Compatible with ASP.NET Entity Framework Core
- T-SQL syntax used in examples
- Consider PostgreSQL as alternative

---

## Notes for Implementation

1. **Soft Deletes**: Use `IsDeleted` or `IsActive` flags instead of hard deletes
2. **Audit Timestamps**: All tables should have `CreatedAt` and `UpdatedAt`
3. **Denormalization**: Asset info is duplicated in MaintenanceRecords for historical accuracy
4. **ID Formats**: Use string IDs with prefixes for business entities (EMP-, MNT-)
5. **Indexing**: Add composite indexes for frequently filtered combinations
