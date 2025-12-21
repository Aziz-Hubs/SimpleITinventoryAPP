/**
 * @file copy-button.tsx
 * @description A utility micro-component for clipboard operations.
 * Provides immediate visual feedback (icon swap) and a "toast" notification
 * upon successful copy.
 * @path /components/shared/copy-button.tsx
 */

"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Props for CopyButton, inheriting all standard Shadcn Button props.
 */
interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  /** The raw string to be injected into the user's clipboard. */
  value: string;
}

/**
 * Copy-to-Clipboard Trigger.
 * Uses the Web Clipboard API and implements a 2-second visual timeout for the
 * "Success" state.
 */
export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  /** Reset the "Copied" icon state after a brief delay for optimal UX. */
  React.useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 transition-opacity", className)}
      onClick={async (e) => {
        // Prevent row selection or other parent click events
        e.stopPropagation();

        try {
          await navigator.clipboard.writeText(value);
          setIsCopied(true);
          toast.success("Copied to clipboard", {
            description: `"${value}" is now in your clipboard.`,
          });
        } catch (err) {
          toast.error("Failed to copy", {
            description: "Please check your browser permissions.",
          });
        }
      }}
      {...props}
    >
      {isCopied ? (
        <Check className="h-3 w-3 text-emerald-500 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );
}
