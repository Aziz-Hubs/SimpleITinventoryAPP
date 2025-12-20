"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconLogout,
  IconUserPlus,
  IconUserMinus,
  IconRefresh,
  IconTag,
  IconCategory,
  IconDeviceLaptop,
  IconDeviceTv,
  IconUsb,
  IconHeadphones,
  IconWifi,
  IconPrinter,
  IconServer,
  IconAlertTriangle,
  IconTrash,
  IconHelpCircle,
  IconCircleCheck,
  IconPaint,
  IconInfoCircle,
  IconUser,
  IconArrowsRightLeft,
  IconFileText
} from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="p-6 bg-linear-to-br from-emerald-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 shadow-sm border border-emerald-500/20">
                  <IconPlus className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">Onboard New Asset</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Register a new item into the inventory ecosystem.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconTag className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Asset Details</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tag" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asset Tag *</Label>
                    <Input id="tag" placeholder="e.g., TAG-2024-001" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-emerald-500/20 bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asset Category *</Label>
                    <Select>
                      <SelectTrigger className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-emerald-500/20 bg-background/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laptop"><div className="flex items-center gap-2"><IconDeviceLaptop className="h-4 w-4" /><span>Laptop</span></div></SelectItem>
                        <SelectItem value="Monitor"><div className="flex items-center gap-2"><IconDeviceTv className="h-4 w-4" /><span>Monitor</span></div></SelectItem>
                        <SelectItem value="Docking"><div className="flex items-center gap-2"><IconUsb className="h-4 w-4" /><span>Docking Station</span></div></SelectItem>
                        <SelectItem value="Headset"><div className="flex items-center gap-2"><IconHeadphones className="h-4 w-4" /><span>Headset</span></div></SelectItem>
                        <SelectItem value="Network"><div className="flex items-center gap-2"><IconWifi className="h-4 w-4" /><span>Network</span></div></SelectItem>
                        <SelectItem value="Printer"><div className="flex items-center gap-2"><IconPrinter className="h-4 w-4" /><span>Printer</span></div></SelectItem>
                        <SelectItem value="Server"><div className="flex items-center gap-2"><IconServer className="h-4 w-4" /><span>Server</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Model Name / Specifications</Label>
                    <Input id="model" placeholder="e.g., MacBook Pro M3 Max" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-emerald-500/20 bg-background/50" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button className="flex-1 sm:flex-none px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 border-none" onClick={() => onOpenChange(false)}>Save Asset</Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function OffboardAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-destructive/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-destructive/10 shadow-sm border border-destructive/20">
                  <IconLogout className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">Offboard Asset</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Permanently retire or dispose of an existing asset.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconAlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Retirement Details</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="off-tag" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asset Tag *</Label>
                    <Input id="off-tag" placeholder="TAG-XXXX" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-destructive/20 bg-background/50 text-destructive font-mono" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Retirement Reason *</Label>
                    <Select>
                      <SelectTrigger className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-destructive/20 bg-background/50">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eol"><div className="flex items-center gap-2"><IconTrash className="h-4 w-4" /><span>End of Life</span></div></SelectItem>
                        <SelectItem value="broken"><div className="flex items-center gap-2"><IconAlertTriangle className="h-4 w-4" /><span>Broken/Damaged</span></div></SelectItem>
                        <SelectItem value="lost"><div className="flex items-center gap-2"><IconHelpCircle className="h-4 w-4" /><span>Lost/Stolen</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-3">
                <IconInfoCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive/80 leading-relaxed">
                  Notice: This action will mark the asset as retired and it will no longer be available for assignment.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button variant="destructive" className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-destructive/20" onClick={() => onOpenChange(false)}>Confirm Retirement</Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AssignAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-indigo-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 shadow-sm border border-indigo-500/20">
                  <IconUserPlus className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">Assign Asset</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Connect an asset with a primary custodian.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconUser className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Assignment Details</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="assign-tag" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asset Tag *</Label>
                    <Input id="assign-tag" placeholder="Scan or type TAG" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50 font-mono" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Employee *</Label>
                    <Input id="employee" placeholder="Search employee..." className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deployment Notes</Label>
                    <Textarea id="notes" placeholder="e.g., Issued for remote work..." rows={4} className="transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50 resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button className="flex-1 sm:flex-none px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 border-none" onClick={() => onOpenChange(false)}>Assign Asset</Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function UnassignAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-orange-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-orange-500/10 shadow-sm border border-orange-500/20">
                  <IconUserMinus className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">Unassign Asset</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Return a deployed asset to the central inventory.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconArrowsRightLeft className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Return Process</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="unassign-tag" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asset Tag *</Label>
                    <Input id="unassign-tag" placeholder="TAG-XXXX" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-orange-500/20 bg-background/50 font-mono" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Return Condition *</Label>
                    <Select>
                      <SelectTrigger className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-orange-500/20 bg-background/50">
                        <SelectValue placeholder="Assess condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOOD"><div className="flex items-center gap-2"><IconCircleCheck className="h-4 w-4 text-emerald-500" /><span>Good</span></div></SelectItem>
                        <SelectItem value="NEW"><div className="flex items-center gap-2"><IconCircleCheck className="h-4 w-4 text-blue-500" /><span>New</span></div></SelectItem>
                        <SelectItem value="FAIR"><div className="flex items-center gap-2"><IconAlertTriangle className="h-4 w-4 text-amber-500" /><span>Fair</span></div></SelectItem>
                        <SelectItem value="BROKEN"><div className="flex items-center gap-2"><IconAlertTriangle className="h-4 w-4 text-red-500" /><span>Broken</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button className="flex-1 sm:flex-none px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 border-none" onClick={() => onOpenChange(false)}>Confirm Unassign</Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ReassignAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-purple-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-purple-500/10 shadow-sm border border-purple-500/20">
                  <IconRefresh className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">Reassign Asset</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Swiftly transfer hardware between employees.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconArrowsRightLeft className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Transfer Protocol</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="re-tag" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asset Tag *</Label>
                    <Input id="re-tag" placeholder="TAG-XXXX" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-purple-500/20 bg-background/50 font-mono" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-user" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Originating User</Label>
                      <Input id="from-user" placeholder="Current User" disabled className="h-10 bg-muted/50 italic border-muted-foreground/10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to-user" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Destination User *</Label>
                      <Input id="to-user" placeholder="New User" className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-purple-500/20 bg-background/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white border-none" onClick={() => onOpenChange(false)}>Transfer Asset</Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
