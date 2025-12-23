"use client";

import * as React from "react";
import { Trash2, ShieldAlert, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Asset } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/shared/action-dialog";
import { useDeleteAsset } from "@/hooks/api/use-assets";

interface BulkDeleteDialogProps {
  assets: Asset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkDeleteDialog({
  assets,
  open,
  onOpenChange,
  onSuccess,
}: BulkDeleteDialogProps) {
  const deleteAsset = useDeleteAsset();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      // In a real app, this would be a single bulk delete API call.
      // For now, we simulate with individual calls or just show success.
      await Promise.all(
        assets.map((asset) => deleteAsset.mutateAsync(asset.id))
      );
      toast.success(`${assets.length} assets deleted successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete some assets");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Deletion"
      description={`You are about to permanently remove ${assets.length} items.`}
      confirmText="Delete Assets"
      variant="destructive"
      onConfirm={handleConfirm}
      isLoading={isDeleting}
      icon={<Trash2 className="h-6 w-6" />}
    >
      <div className="space-y-6">
        <Alert
          variant="destructive"
          className="bg-destructive/5 border-destructive/10"
        >
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">
            Permanent Action
          </AlertTitle>
          <AlertDescription className="text-[11px] opacity-80 leading-relaxed">
            This action cannot be undone. Records will be removed from all
            inventory logs.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <List className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Affected Assets
            </span>
          </div>
          <div className="rounded-xl border bg-muted/20 divide-y max-h-[200px] overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 text-sm flex items-center justify-between group hover:bg-background transition-all"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs">
                        {asset.make} {asset.model}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-70">
                        {asset.serviceTag}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[8px] uppercase font-bold tracking-tighter h-4 px-1 bg-background/50"
                    >
                      {asset.category}
                    </Badge>
                  </div>
                ))}
                {assets.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground italic">
                    No assets selected
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </ActionDialog>
  );
}
