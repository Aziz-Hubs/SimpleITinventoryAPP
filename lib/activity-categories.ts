import {
    UserPlus,
    Settings2,
    User,
    Shield,
    Activity as ActivityIcon,
} from "lucide-react";

/**
 * Activity Log Categories
 * 
 * This file contains the categorization system for activity logs.
 * Categories help organize and filter activities based on their type.
 */

export type ActivityCategory =
    | "assignment"
    | "maintenance"
    | "account"
    | "system"
    | "other";

export interface CategoryDetails {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
    description: string;
}

/**
 * Collection of all activity log categories with their visual properties
 */
export const ACTIVITY_CATEGORIES: Record<ActivityCategory, CategoryDetails> = {
    assignment: {
        icon: UserPlus,
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
        label: "Assignment",
        description: "Asset assignments, check-outs, returns, and requests",
    },
    maintenance: {
        icon: Settings2,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
        label: "Maintenance",
        description: "Maintenance tasks, firmware updates, backups, and deployments",
    },
    account: {
        icon: User,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
        label: "Account",
        description: "User account activities, permissions, and authentication",
    },
    system: {
        icon: Shield,
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
        label: "System",
        description: "System events, anomalies, and security-related activities",
    },
    other: {
        icon: ActivityIcon,
        color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20",
        label: "Other",
        description: "Miscellaneous activities that don't fit other categories",
    },
};

/**
 * Determines the category of an activity based on its action string
 * @param action - The action string from the activity log
 * @returns The category that best matches the action
 */
export function getActionCategory(action: string): ActivityCategory {
    const a = action.toLowerCase();

    // Assignment-related activities
    if (
        a.includes("assigned") ||
        a.includes("check") ||
        a.includes("return") ||
        a.includes("requested")
    ) {
        return "assignment";
    }

    // Maintenance-related activities
    if (
        a.includes("maintenance") ||
        a.includes("firmware") ||
        a.includes("backup") ||
        a.includes("deployed") ||
        a.includes("restarted")
    ) {
        return "maintenance";
    }

    // Account-related activities
    if (
        a.includes("user") ||
        a.includes("permission") ||
        a.includes("logged")
    ) {
        return "account";
    }

    // System-related activities
    if (
        a.includes("anomaly") ||
        a.includes("flagged") ||
        a.includes("detected")
    ) {
        return "system";
    }

    // Default to "other" for unmatched activities
    return "other";
}

/**
 * Gets the visual details for a specific category
 * @param category - The activity category
 * @returns The category details including icon, color, and label
 */
export function getCategoryDetails(category: ActivityCategory): CategoryDetails {
    return ACTIVITY_CATEGORIES[category];
}

/**
 * Gets all available categories as an array
 * @returns Array of all category keys
 */
export function getAllCategories(): ActivityCategory[] {
    return Object.keys(ACTIVITY_CATEGORIES) as ActivityCategory[];
}
