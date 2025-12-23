---
title: Project Overview
description: Executive summary and core features of the Simple IT Inventory App
tags: [overview, context]
---

# Simple IT Inventory App - Project Overview

**Simple IT Inventory App** is a comprehensive web-based IT asset management system designed to track, manage, and maintain organizational hardware inventory. Built with Next.js and designed for integration with an ASP.NET backend, the application provides a modern, glassmorphism-styled interface for IT administrators to manage assets, employees, maintenance requests, and deployment operations.

## Core Features

- **Dashboard**: KPI Cards, Time-Series Charts, Activity Feed, Quick Stats.
- **Inventory Management**: CRUD for assets, categorizing, state tracking, and assignment.
- **Employee Directory**: Manage employees and track their assigned assets.
- **Maintenance Tracking**: Ticket lifecycle, priority levels, technician assignment, cost tracking.
- **Hardware Models**: Standardized device templates and specs.
- **Deployment Operations**: Onboarding, offboarding, and reassigning assets.

## Key Design Decisions

1. **Mock-First Development**: Supports rapid frontend iteration without a backend.
2. **Zod Schema Validation**: Type-safe form validation.
3. **Glassmorphism UI**: Premium aesthetic using Tailwind CSS.
4. **Service Layer Pattern**: Abstraction over data fetching (API vs Mock).
5. **Multi-Tenancy Ready**: Database schema designed for multi-tenancy.
