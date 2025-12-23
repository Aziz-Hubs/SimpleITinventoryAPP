"use client";

import { IconDeviceDesktop as IconHardware } from "@tabler/icons-react";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { ModelForm } from "./model-form";
import { useModelMutation } from "@/hooks/api/use-models";
import { ModelCreate } from "@/lib/types";

interface CreateModelSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateModelSheet({
  open: controlledOpen,
  onOpenChange,
}: CreateModelSheetProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { create } = useModelMutation();

  const FORM_ID = "create-model-form";

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (data: ModelCreate) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setIsOpen(false);
    } catch (error) {
      // Error handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if we're in controlled mode
  const isControlled = controlledOpen !== undefined;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Only show trigger button in uncontrolled mode */}
      {!isControlled && (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Model
          </Button>
        </SheetTrigger>
      )}
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
                    Add New Model
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Create a new hardware model definition in the catalog.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-10">
              <ModelForm
                id={FORM_ID}
                onSubmit={handleSubmit}
                hideSubmitButton
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-muted/20 backdrop-blur-md flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Model
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
