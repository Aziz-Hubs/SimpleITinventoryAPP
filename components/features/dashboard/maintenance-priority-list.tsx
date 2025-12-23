import { Asset, AssetStateEnum } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ArrowRight, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenancePriorityListProps {
  assets: Asset[];
  onViewDetails: (asset: Asset) => void;
}

export function MaintenancePriorityList({
  assets,
  onViewDetails,
}: MaintenancePriorityListProps) {
  const maintenanceItems = assets.filter((a) =>
    [AssetStateEnum.Broken, AssetStateEnum.Fair].includes(a.state)
  );

  if (maintenanceItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed bg-muted/30">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold">All Systems Operational</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          There are no assets currently marked as broken or requiring immediate
          attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-bold text-foreground">
            {maintenanceItems.length}
          </span>{" "}
          items requiring attention.
        </p>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-red-500/5 text-red-600 border-red-200"
          >
            {
              maintenanceItems.filter((i) => i.state === AssetStateEnum.Broken)
                .length
            }{" "}
            Critical
          </Badge>
          <Badge
            variant="outline"
            className="bg-yellow-500/5 text-yellow-600 border-yellow-200"
          >
            {
              maintenanceItems.filter((i) => i.state === AssetStateEnum.Fair)
                .length
            }{" "}
            Warnings
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[400px] w-full rounded-2xl border bg-muted/10 p-4">
        <div className="grid gap-3">
          {maintenanceItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm cursor-pointer"
              onClick={() => onViewDetails(item)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 p-2 rounded-lg shrink-0 ${
                    item.state === AssetStateEnum.Broken
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-600"
                  }`}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base tracking-tight">
                      {item.make} {item.model}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[10px] font-bold tracking-wider ${
                        item.state === AssetStateEnum.Broken
                          ? "border-red-200 text-red-700 bg-red-50"
                          : "border-yellow-200 text-yellow-700 bg-yellow-50"
                      }`}
                    >
                      {item.state}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
                      <Tag className="h-3 w-3" />
                      <span className="font-mono font-medium">
                        {item.serviceTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-3 sm:mt-0 font-medium text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onViewDetails(item)}
              >
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
