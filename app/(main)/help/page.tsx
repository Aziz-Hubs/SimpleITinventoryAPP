"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import {
  IconLifebuoy,
  IconMail,
  IconPhone,
  IconWorld,
  IconBook,
  IconQuestionMark,
  IconChevronDown,
  IconChevronRight,
  IconBox,
  IconServer,
  IconHistory,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-muted-foreground text-lg">
          Find documentation, frequently asked questions, and support contact
          details below.
        </p>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-xs"
          asChild
        >
          <a
            href="https://telsource.acuative.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardHeader>
              <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80 font-medium">Helpdesk Site</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <IconWorld className="h-5 w-5 text-indigo-500" />
                </div>
                telsource
              </CardTitle>
              <CardAction>
                <IconChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access our full range of support resources and submit tickets
                directly through our portal.
              </p>
            </CardContent>
          </a>
        </Card>

        <Card
          className="bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-xs"
          asChild
        >
          <a href="mailto:helpdesk@acuative.com">
            <CardHeader>
              <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80 font-medium">Email Support</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <IconMail className="h-5 w-5 text-emerald-500" />
                </div>
                helpdesk@acuative.com
              </CardTitle>
              <CardAction>
                <IconChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Send us an email and our support team will get back to you
                within 24 hours.
              </p>
            </CardContent>
          </a>
        </Card>

        <Card
          className="bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-xs"
          asChild
        >
          <a href="tel:9595">
            <CardHeader>
              <CardDescription className="text-sky-600/80 dark:text-sky-400/80 font-medium">Line Support</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <IconPhone className="h-5 w-5 text-sky-500" />
                </div>
                Extension 9595
              </CardTitle>
              <CardAction>
                <IconChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For immediate assistance, dial extension 9595 to speak with a
                support representative.
              </p>
            </CardContent>
          </a>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-4">
        {/* Documentation Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <IconBook className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Documentation</h2>
          </div>

          <div className="grid gap-4">
            <Card className="bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <IconBox className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Inventory Master</CardTitle>
                  <CardDescription>
                    Centralized Asset Management
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Inventory Master page is your central hub for all company
                  assets. You can track status, location, and ownership of every
                  piece of equipment in real-time. Use the search and filter
                  functions to quickly find specific assets.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <IconServer className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Deployment Operations
                  </CardTitle>
                  <CardDescription>Lifecycle & Maintenance</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Manage the entire lifecycle of an asset from onboarding new
                  inventory to offboarding retired equipment. This module also
                  handles asset assignments, unassignments, and maintenance
                  tracking with detailed notes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <IconHistory className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Activities Log</CardTitle>
                  <CardDescription>Audit & Compliance</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every action taken within the system is recorded in the
                  Activities Log. This ensures a complete audit trail for
                  compliance and troubleshooting purposes. You can filter by
                  date, user, or action type.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <IconQuestionMark className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I onboard a new asset?</AccordionTrigger>
              <AccordionContent>
                Navigate to <strong>Deployment Operations</strong> and click the{" "}
                <strong>Onboard</strong> card. Fill in the required asset
                details including tag, category, and serial number to add it to
                the inventory.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                How can I assign an asset to an employee?
              </AccordionTrigger>
              <AccordionContent>
                In the <strong>Deployment Operations</strong> page, select{" "}
                <strong>Assign</strong>. You'll be prompted to select a user and
                the asset you wish to assign. The system will automatically
                update the asset's status.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Where can I see the history of a specific asset?
              </AccordionTrigger>
              <AccordionContent>
                Go to the <strong>Activities Log</strong> page and use the
                search bar to enter the asset's service tag. This will filter
                the log to show all recorded events related to that specific
                asset.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                What should I do if an asset needs maintenance?
              </AccordionTrigger>
              <AccordionContent>
                Maintainance notes can be tracked in the{" "}
                <strong>Deployment Operations</strong> page under the{" "}
                <strong>Maintenance Tracker</strong> tab. You can review
                existing issues or note down new ones to keep the equipment in
                peak condition.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                How do I retire or dispose of an asset?
              </AccordionTrigger>
              <AccordionContent>
                Use the <strong>Offboard</strong> function in{" "}
                <strong>Deployment Operations</strong>. This will formally
                remove the asset from active service while maintaining its
                history in the system for archival purposes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Can't find what you're looking for?</CardTitle>
          <CardDescription>
            Our support team is available 24/7 for critical issues.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <a href="mailto:helpdesk@acuative.com">Contact Support Team</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
