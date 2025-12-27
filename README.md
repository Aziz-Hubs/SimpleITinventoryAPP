# Simple IT Inventory App

As a university student juggling my studies with a part-time job as a help desk associate, I've spent a lot of time with spreadsheets and outdated inventory systems that make tracking IT equipment a chore. After about six months of diving deep into programming, I decided to build something that would solve a real problem for myself and my team.

**Simple IT Inventory App** is my first major project, born from the daily challenges of IT support. It's a web-based application designed to make managing and tracking hardware assets simple, intuitive, and efficient, especially for small to medium-sized IT departments that might not have the budget for expensive enterprise solutions. This project is my attempt to apply what I'm learning and to build something genuinely useful.

## Key Features

- **User Authentication:** Secure user authentication and authorization powered by Supabase.
- **Inventory Management:** Add, view, edit, and delete assets in a centralized inventory. Track detailed information for each piece of equipment.
- **Asset Assignment:** Assign assets to employees and easily view all equipment allocated to an individual.
- **Deployment Operations:** Manage the deployment of new hardware and track the status of ongoing operations.
- **Activity Dashboard:** View a log of recent activities and get a quick overview of inventory statistics.
- **Employee Directory:** Maintain a list of employees and their assigned assets.
- **Maintenance Tracking:** Log and monitor maintenance activities for all assets.
- **User-Friendly Interface:** A clean and modern UI built with accessibility in mind.

## Tech Stack

- **Database/Auth:** [Supabase](https://supabase.com/)
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
- **Data Tables:** [TanStack Table](https://tanstack.com/table)
- **Charts:** [Recharts](https://recharts.org/)
- **State Management:** React Context & SWR for data fetching (inferred from `hooks/api-hooks.ts`)

## Authentication

This application leverages [Supabase](https://supabase.com/) for robust and secure user authentication. Supabase provides a comprehensive authentication solution, including:

-   **User Management:** Handles user registration, login, and profile management.
-   **Secure Sessions:** Manages secure user sessions and protects against unauthorized access.
-   **OAuth Providers:** Supports integration with various OAuth providers for easy sign-in (e.g., Google, GitHub).

## Getting Started

## Getting Started

To run this project locally, you'll need to set up your Supabase environment variables. Create a `.env.local` file in the root directory of the project and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project URL and anonymous key, respectively. You can find these in your Supabase project settings.

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Status

This project is under active development. Features are continuously being added and improved.
