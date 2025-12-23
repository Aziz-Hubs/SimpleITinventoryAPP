/**
 * @file app-sidebar.tsx
 * @description Main application sidebar containing navigation, quick actions, and user menu.
 * Manages keyboard shortcuts (Ctrl+Space) for quick inventory adjustment.
 * @path /components/layout/app-sidebar.tsx
 */

"use client";

import * as React from "react";
import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBox,
  IconServer,
  IconHistory,
  IconPencil,
  IconTool,
  IconCpu,
  IconReceipt,
} from "@tabler/icons-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Label } from "../ui/label";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: IconBox,
    },
    {
      title: "Models",
      url: "/models",
      icon: IconCpu,
    },
    {
      title: "Deployment",
      url: "/deployment",
      icon: IconServer,
    },
    {
      title: "Employees List",
      url: "/employees",
      icon: IconUsers,
    },
    {
      title: "Activities Log",
      url: "/activities",
      icon: IconHistory,
    },
    {
      title: "Maintenance",
      url: "/maintenance",
      icon: IconTool,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: IconReceipt,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
  ],
};

import { SearchPalette } from "../shared/search-palette";
import { EditItemDialog } from "../features/inventory/edit-item-dialog";
import { NotificationsCenter } from "../features/notifications/notifications-center";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setEditOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Sidebar collapsible="icon" className="glass border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acuative</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          onQuickAdjust={() => setEditOpen(true)}
          onNotifications={() => setNotificationsOpen(true)}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <EditItemDialog open={editOpen} onOpenChange={setEditOpen} />
      <NotificationsCenter
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </Sidebar>
  );
}
