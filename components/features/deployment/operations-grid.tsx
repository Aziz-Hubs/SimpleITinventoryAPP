import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import {
  IconPlus,
  IconTrash,
  IconUserPlus,
  IconUserMinus,
  IconRefresh,
  IconTool,
} from "@tabler/icons-react";

interface OperationsGridProps {
  onOnboard: () => void;
  onOffboard: () => void;
  onAssign: () => void;
  onUnassign: () => void;
  onReassign: () => void;
  onMaintenance: () => void;
}

export function OperationsGrid({
  onOnboard,
  onOffboard,
  onAssign,
  onUnassign,
  onReassign,
  onMaintenance,
}: OperationsGridProps) {
  return (
    <div className="space-y-6">
      {/* Asset Lifecycle Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight text-muted-foreground/80 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
          Asset Management
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-emerald-500/5 from-emerald-500/10 to-card border-emerald-500/20 hover:border-emerald-500/40"
            onClick={onOnboard}
          >
            <CardHeader>
              <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                New Asset
              </CardDescription>
              <CardTitle className="text-xl font-bold">Onboard</CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <IconPlus className="h-5 w-5 text-emerald-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <div className="text-muted-foreground text-sm">
                Add new inventory
              </div>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-rose-500/5 from-rose-500/10 to-card border-rose-500/20 hover:border-rose-500/40"
            onClick={onOffboard}
          >
            <CardHeader>
              <CardDescription className="text-rose-600/80 dark:text-rose-400/80 font-medium">
                Retire Asset
              </CardDescription>
              <CardTitle className="text-xl font-bold">Offboard</CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <IconTrash className="h-5 w-5 text-rose-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <div className="text-muted-foreground text-sm">
                Dispose or recycle
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Distribution Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight text-muted-foreground/80 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/70" />
          Distribution
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-indigo-500/5 from-indigo-500/10 to-card border-indigo-500/20 hover:border-indigo-500/40"
            onClick={onAssign}
          >
            <CardHeader>
              <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80 font-medium">
                Distribution
              </CardDescription>
              <CardTitle className="text-xl font-bold">Assign</CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <IconUserPlus className="h-5 w-5 text-indigo-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <div className="text-muted-foreground text-sm">
                Issue to employee
              </div>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-purple-500/5 from-purple-500/10 to-card border-purple-500/20 hover:border-purple-500/40"
            onClick={onReassign}
          >
            <CardHeader>
              <CardDescription className="text-purple-600/80 dark:text-purple-400/80 font-medium">
                Transfer
              </CardDescription>
              <CardTitle className="text-xl font-bold">Reassign</CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <IconRefresh className="h-5 w-5 text-purple-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <div className="text-muted-foreground text-sm">User to user</div>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-amber-500/5 from-amber-500/10 to-card border-amber-500/20 hover:border-amber-500/40"
            onClick={onUnassign}
          >
            <CardHeader>
              <CardDescription className="text-amber-600/80 dark:text-amber-400/80 font-medium">
                Collection
              </CardDescription>
              <CardTitle className="text-xl font-bold">Unassign</CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <IconUserMinus className="h-5 w-5 text-amber-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <div className="text-muted-foreground text-sm">
                Return to stock
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Service Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight text-muted-foreground/80 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500/70" />
          Service & Maintenance
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-sky-500/5 from-sky-500/10 to-card border-sky-500/20 hover:border-sky-500/40"
            onClick={onMaintenance}
          >
            <CardHeader>
              <CardDescription className="text-sky-600/80 dark:text-sky-400/80 font-medium">
                Service Request
              </CardDescription>
              <CardTitle className="text-xl font-bold">Maintenance</CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <IconTool className="h-5 w-5 text-sky-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <div className="text-muted-foreground text-sm">
                Create request
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
