"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaintenanceRequest } from "@/services/maintenance-service";
import type {
  MaintenanceCategory,
  MaintenancePriority,
} from "@/lib/maintenance-types";
import { IconLoader2 } from "@tabler/icons-react";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: MaintenanceDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    assetTag: "",
    assetCategory: "",
    assetMake: "",
    assetModel: "",
    issue: "",
    description: "",
    category: "hardware" as MaintenanceCategory,
    priority: "medium" as MaintenancePriority,
    technician: "",
    scheduledDate: "",
    estimatedCost: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createMaintenanceRequest({
        assetTag: formData.assetTag,
        assetCategory: formData.assetCategory,
        assetMake: formData.assetMake,
        assetModel: formData.assetModel,
        issue: formData.issue,
        description: formData.description,
        category: formData.category,
        status: "pending",
        priority: formData.priority,
        technician: formData.technician || undefined,
        reportedBy: "Current User", // Replace with actual user context
        scheduledDate: formData.scheduledDate || undefined,
        estimatedCost: formData.estimatedCost
          ? parseFloat(formData.estimatedCost)
          : undefined,
      });

      // Reset form
      setFormData({
        assetTag: "",
        assetCategory: "",
        assetMake: "",
        assetModel: "",
        issue: "",
        description: "",
        category: "hardware",
        priority: "medium",
        technician: "",
        scheduledDate: "",
        estimatedCost: "",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create maintenance request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
          <DialogDescription>
            Submit a new maintenance request for an asset. Fill in the details
            below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Service Tag *</Label>
              <Input
                id="assetTag"
                placeholder="e.g., F3XVC24"
                value={formData.assetTag}
                onChange={(e) =>
                  setFormData({ ...formData, assetTag: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetCategory">Asset Category *</Label>
              <Select
                value={formData.assetCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, assetCategory: value })
                }
                required
              >
                <SelectTrigger id="assetCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Docking">Docking Station</SelectItem>
                  <SelectItem value="Headset">Headset</SelectItem>
                  <SelectItem value="Network">Network Equipment</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetMake">Make</Label>
              <Input
                id="assetMake"
                placeholder="e.g., Dell"
                value={formData.assetMake}
                onChange={(e) =>
                  setFormData({ ...formData, assetMake: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetModel">Model</Label>
              <Input
                id="assetModel"
                placeholder="e.g., Vostro 3520"
                value={formData.assetModel}
                onChange={(e) =>
                  setFormData({ ...formData, assetModel: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">Issue Summary *</Label>
            <Input
              id="issue"
              placeholder="Brief description of the issue"
              value={formData.issue}
              onChange={(e) =>
                setFormData({ ...formData, issue: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Issue Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as MaintenanceCategory,
                  })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="preventive">
                    Preventive Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as MaintenancePriority,
                  })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technician">Assign Technician</Label>
              <Input
                id="technician"
                placeholder="Technician name (optional)"
                value={formData.technician}
                onChange={(e) =>
                  setFormData({ ...formData, technician: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.estimatedCost}
              onChange={(e) =>
                setFormData({ ...formData, estimatedCost: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
