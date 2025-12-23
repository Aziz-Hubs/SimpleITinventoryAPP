"use client";

import { IconDeviceDesktop as IconHardware } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ModelForm } from "./model-form";
import { useModelMutation } from "@/hooks/api/use-models";
import { Model, ModelCreate } from "@/lib/types";

interface EditModelSheetProps {
  model: Model | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModelSheet({
  model,
  open,
  onOpenChange,
}: EditModelSheetProps) {
  const { update } = useModelMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!model) return null;

  const FORM_ID = "edit-model-form";

  const handleSubmit = async (data: ModelCreate) => {
    if (model.id) {
      setIsSubmitting(true);
      try {
        await update(model.id, data);
        onOpenChange(false);
      } catch (error) {
        // Error handled by mutation hook
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="p-6 bg-linear-to-br from-indigo-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 shadow-sm border border-indigo-500/20">
                  <IconHardware className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Edit Model
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Update the details and specifications for this model.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-10">
              <ModelForm
                id={FORM_ID}
                defaultValues={model}
                onSubmit={handleSubmit}
                hideSubmitButton
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-muted/20 backdrop-blur-md flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
