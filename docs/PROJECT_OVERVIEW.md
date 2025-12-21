# Simple IT Inventory App - Project Overview

## Executive Summary

**Simple IT Inventory App** is a comprehensive web-based IT asset management system designed to track, manage, and maintain organizational hardware inventory. Built with Next.js and designed for integration with an ASP.NET backend, the application provides a modern, glassmorphism-styled interface for IT administrators to manage assets, employees, maintenance requests, and deployment operations.

---

## Tech Stack

| Layer                  | Technology                                     |
| ---------------------- | ---------------------------------------------- |
| **Frontend Framework** | Next.js 14+ (App Router)                       |
| **Language**           | TypeScript                                     |
| **Styling**            | Tailwind CSS with custom glassmorphism theme   |
| **UI Components**      | shadcn/ui (Radix primitives)                   |
| **Form Validation**    | Zod schemas                                    |
| **State Management**   | React hooks + localStorage (mock mode)         |
| **API Client**         | Custom fetch wrapper with Bearer token support |
| **Charts**             | Recharts                                       |
| **Backend (planned)**  | ASP.NET Core Web API                           |

---

## Core Features

### 1. Dashboard

- **KPI Cards**: Total assets, deployment rate, stock availability, maintenance status
- **Time-Series Charts**: Asset trends over time (laptops, monitors, peripherals)
- **Activity Feed**: Recent system activities and audit log
- **Quick Stats**: Assigned vs. unassigned assets breakdown

### 2. Inventory Management

- Full CRUD operations for IT assets
- Category-based filtering (Laptop, Monitor, Docking, Headset, Desktop, etc.)
- State tracking (NEW, GOOD, FAIR, BROKEN)
- Employee assignment and location tracking
- CSV import/export functionality
- Advanced search and column visibility controls

### 3. Employee Directory

- Employee listing with department and position
- Asset assignment tracking per employee
- Employee CRUD operations
- Bulk import via CSV

### 4. Maintenance Tracking

- Maintenance ticket creation and lifecycle management
- Priority levels (Critical, High, Medium, Low)
- Status workflow (Pending → In-Progress → Completed/Cancelled)
- Technician assignment
- Timeline events and comment history
- Cost tracking (parts, labor, estimates)

### 5. Hardware Models

- Standardized device templates
- Specification presets for quick asset creation
- Category-based model organization

### 6. Deployment Operations

- **Onboard Asset**: Register new assets into the system
- **Offboard Asset**: Retire/decommission assets
- **Reassign Asset**: Transfer assets between employees
- Activity logging with deployment comments

---

## Project Structure

```
SimpleITinventoryAPP/
├── app/                          # Next.js App Router pages
│   ├── (main)/                   # Authenticated layout group
│   │   ├── activities/           # Activity log page
│   │   ├── deployment/           # Deployment operations
│   │   ├── employees/            # Employee directory
│   │   ├── help/                 # Help documentation
│   │   ├── inventory/            # Asset inventory
│   │   ├── maintenance/          # Maintenance tickets
│   │   ├── models/               # Hardware models
│   │   ├── settings/             # Application settings
│   │   └── page.tsx              # Dashboard (main page)
│   ├── globals.css               # Global styles + theme
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── deployment/           # Deployment dialogs
│   │   ├── employees/            # Employee tables/dialogs
│   │   ├── inventory/            # Asset dialogs and forms
│   │   ├── maintenance/          # Maintenance components
│   │   └── models/               # Model sheets
│   ├── layout/                   # Layout components (sidebar, header)
│   ├── shared/                   # Reusable components
│   └── ui/                       # shadcn/ui base components
│
├── services/                     # Data fetching layer
│   ├── dashboard-service.ts      # Dashboard aggregations
│   ├── employee-service.ts       # Employee CRUD
│   ├── inventory-service.ts      # Asset CRUD
│   ├── maintenance-service.ts    # Maintenance CRUD
│   └── model-service.ts          # Model CRUD
│
├── lib/
│   ├── types/                    # TypeScript interfaces & Zod schemas
│   │   ├── asset.ts
│   │   ├── employee.ts
│   │   ├── maintenance.ts
│   │   ├── model.ts
│   │   └── common.ts
│   ├── api-client.ts             # HTTP client with auth support
│   ├── mock-storage.ts           # LocalStorage-based mock persistence
│   └── utils.ts                  # Utility functions
│
├── data/                         # Mock JSON data files
│   ├── inv.json                  # Inventory assets
│   ├── employees.json            # Employee directory
│   ├── maintenance.json          # Maintenance records
│   ├── models.json               # Hardware models
│   └── technicians.json          # Technician list
│
└── hooks/                        # Custom React hooks
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  Pages/Components                                                │
│       │                                                          │
│       ▼                                                          │
│  Services Layer (inventory-service, employee-service, etc.)      │
│       │                                                          │
│       ├──[Mock Mode]──► MockStorage (localStorage)               │
│       │                      │                                   │
│       │                      ▼                                   │
│       │                 data/*.json (initial hydration)          │
│       │                                                          │
│       └──[Real Mode]──► apiClient.ts                             │
│                              │                                   │
│                              ▼                                   │
│                    ASP.NET Backend API                           │
└─────────────────────────────────────────────────────────────────┘
```

### Mock Data Mode

- Controlled via `NEXT_PUBLIC_USE_MOCK_DATA` environment variable
- Uses `localStorage` for state persistence across sessions
- Initial data loaded from JSON files in `/data/` directory
- Enables full development without backend

### Real API Mode

- Bearer token authentication
- Automatic 401 handling (redirect to login)
- Request/response logging (dev mode)
- Timeout and error handling

---

## Asset Categories

| Category       | Description                          |
| -------------- | ------------------------------------ |
| Laptop         | Portable computers                   |
| Desktop        | Stationary workstations              |
| Monitor        | Display screens                      |
| Docking        | Docking stations                     |
| Headset        | Audio devices                        |
| Network Switch | Network infrastructure               |
| Firewall       | Security devices                     |
| Access Point   | Wireless access points               |
| 5G/4G Modem    | Cellular connectivity                |
| UPS            | Uninterruptible power supplies       |
| NVR            | Network video recorders              |
| Printer        | Printing devices                     |
| TV             | Display screens for conference rooms |

---

## Asset States

| State  | Description                              |
| ------ | ---------------------------------------- |
| NEW    | Recently acquired, unused                |
| GOOD   | Fully operational                        |
| FAIR   | Functional with minor issues             |
| BROKEN | Non-functional, needs repair/replacement |

---

## Environment Configuration

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_LOGGING=true
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

---

## Key Design Decisions

1. **Mock-First Development**: All services support mock mode for rapid frontend development
2. **Zod Schema Validation**: Type-safe form validation with compile-time guarantees
3. **Glassmorphism UI**: Modern, premium aesthetic with glass-effect components
4. **Service Layer Pattern**: Clean separation between UI components and data fetching
5. **LocalStorage Persistence**: Mock data survives page refreshes during development
