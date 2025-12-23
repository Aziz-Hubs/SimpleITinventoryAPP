---
title: Domain Models
description: Definitions of business logic, asset categories, and states
tags: [domain, logic]
---

# Domain Models

## Asset Categories

- **Laptop**: Portable computers
- **Desktop**: Stationary workstations
- **Monitor**: Display screens
- **Docking**: Docking stations
- **Headset**: Audio devices
- **Network Switch**: Network infrastructure
- **Server**: Server hardware
- **Printer**: Printing devices
- **Mobile**: Tablets/Phones

## Asset States

1. **NEW**: Recently acquired, unused.
2. **GOOD**: Fully operational.
3. **FAIR**: Functional with minor issues.
4. **BROKEN**: Non-functional, needs repair/replacement.

## Maintenance Priorities

- **Critical**: Needs immediate attention.
- **High**: Urgent but not blocking business continuity.
- **Medium**: Standard repair queue.
- **Low**: Aesthetic or minor functional issues.

## Maintenance Status Workflow

Pending -> InProgress -> Completed (or Cancelled)
