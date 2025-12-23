---
title: Development Guide
description: Setup instructions, scripts, and environment configuration
tags: [setup, dev-guide]
---

# Development & Setup

## Scripts

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run Type Checking
npx tsc --noEmit

# Run Linting
npm run lint
```

## Environment Configuration (.env.local)

- `NEXT_PUBLIC_API_BASE_URL`: URL of the ASP.NET Backend (e.g., `http://localhost:5000/api`)
- `NEXT_PUBLIC_USE_MOCK_DATA`: Set to `true` to use client-side mock storage, `false` for real API.
- `NEXT_PUBLIC_API_LOGGING`: Enable console logging for API requests.

## Conventions

- **Paths**: Use absolute imports (e.g., `@/components/...`).
- **Components**: Feature-first folder structure.
- **Naming**: kebab-case for files, PascalCase for components.
- **Tables**: Use `DataTable` component with pagination.
