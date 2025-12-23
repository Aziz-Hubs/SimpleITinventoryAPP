---
title: System Architecture
description: Tech stack, project structure, and data flow diagrams
tags: [architecture, tech-stack]
---

# Architecture & Tech Stack

## Tech Stack

| Layer                 | Technology                                   |
| --------------------- | -------------------------------------------- |
| **Frontend**          | Next.js 14+ (App Router)                     |
| **Language**          | TypeScript                                   |
| **Styling**           | Tailwind CSS with custom glassmorphism theme |
| **UI Components**     | shadcn/ui (Radix primitives)                 |
| **Form Validation**   | Zod schemas                                  |
| **State Management**  | React hooks + localStorage (mock mode)       |
| **Backend (Target)**  | ASP.NET Core Web API                         |
| **Database (Target)** | SQL Server / EF Core                         |

## Project Structure

```text
SimpleITinventoryAPP/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Authenticated routes (Inventory, Maintenance, etc.)
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── features/                 # Domain-specific components
│   ├── layout/                   # Global layout (Sidebar, Header)
│   ├── shared/                   # Reusable components
│   └── ui/                       # shadcn/ui base components
├── services/                     # Data fetching abstraction
├── lib/
│   ├── types/                    # TypeScript interfaces & Zod schemas
│   └── api-client.ts             # HTTP client
└── data/                         # Mock JSON data
```

## Data Flow

Frontend (Pages) -> Service Layer -> [MockStorage | API Client] -> [LocalStorage | ASP.NET Backend]

- **Mock Mode**: Toggled via `NEXT_PUBLIC_USE_MOCK_DATA`.
- **Real Mode**: Uses Bearer token authentication and strict REST API contracts.
