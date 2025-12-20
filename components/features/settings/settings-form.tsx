"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  User,
  Settings2,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Cloud,
  Mail,
  Smartphone,
  Check,
  Save,
  Clock,
  Coins,
  Server,
  HardDrive,
  Activity,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Package,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Cpu,
  MemoryStick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  useThemeColor,
  type ThemeColor,
} from "@/components/features/settings/theme-color-provider";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function SettingsForm() {
  const { setTheme, theme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();
  const [isSaving, setIsSaving] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Avatar updated! Don't forget to save changes.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-24 w-24 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20 overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-primary/40" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarClick}
                  >
                    Change Avatar
                  </Button>
                </div>
                <div className="flex-1 grid gap-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        defaultValue="Shadcn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        defaultValue="Admin"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      defaultValue="m@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="IT Administrator at Acuative Corp."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security and authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Secure your account with 2FA.
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Management</Label>
                  <p className="text-sm text-muted-foreground">
                    Log out from all other devices.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Log Out Others
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about inventory changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <Label>Inventory Updates</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Smartphone className="h-4 w-4 text-primary" />
                      </div>
                      <Label>Device Assignments</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <Label>Deployment Status</Label>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Appearance Mode</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto flex-col gap-3 p-4 border-2 transition-all",
                      theme === "light"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setTheme("light")}
                  >
                    <div className="w-full aspect-video bg-zinc-100 rounded-md border flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-white rounded shadow-sm border" />
                    </div>
                    <span className="text-sm font-medium">Light</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto flex-col gap-3 p-4 border-2 transition-all",
                      theme === "dark"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="w-full aspect-video bg-zinc-900 rounded-md border border-zinc-700 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-zinc-950 rounded shadow-sm border border-zinc-800" />
                    </div>
                    <span className="text-sm font-medium">Dark</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto flex-col gap-3 p-4 border-2 transition-all",
                      theme === "system"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setTheme("system")}
                  >
                    <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-md border flex items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-900">
                      <div className="w-3/4 h-3/4 bg-white dark:bg-zinc-950 rounded shadow-sm border" />
                    </div>
                    <span className="text-sm font-medium">System</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base">Color Theme</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(
                    ["zinc", "rose", "blue", "green", "orange"] as ThemeColor[]
                  ).map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className={cn(
                        "h-auto flex-col gap-3 p-3 border-2 transition-all",
                        themeColor === color
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-muted hover:border-primary/50"
                      )}
                      onClick={() => setThemeColor(color)}
                    >
                      <div
                        className={cn("w-full h-8 rounded-full shadow-sm", {
                          "bg-zinc-900 dark:bg-zinc-100": color === "zinc",
                          "bg-rose-500": color === "rose",
                          "bg-blue-500": color === "blue",
                          "bg-green-500": color === "green",
                          "bg-orange-500": color === "orange",
                        })}
                      />
                      <span className="text-xs font-medium capitalize">
                        {color}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>English (US)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fr">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>French</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="de">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>German</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="es">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Spanish</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {/* System Information */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                Core system details and version information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Version</span>
                  </div>
                  <p className="text-lg font-semibold">v2.4.1</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Build Date</span>
                  </div>
                  <p className="text-lg font-semibold">Dec 15, 2025</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>System Uptime</span>
                  </div>
                  <p className="text-lg font-semibold">47d 12h 23m</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Cpu className="h-4 w-4" />
                    <span>CPU Usage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[23%]" />
                    </div>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MemoryStick className="h-4 w-4" />
                    <span>Memory Usage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[67%]" />
                    </div>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Statistics */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Statistics
              </CardTitle>
              <CardDescription>
                Current database metrics and storage information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Package className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Employees</p>
                      <p className="text-2xl font-bold">342</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <FileText className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Maintenance</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Activity className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Activities</p>
                      <p className="text-2xl font-bold">5,621</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span>Database Size</span>
                  </div>
                  <p className="text-lg font-semibold">2.4 GB</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Growth Rate</span>
                  </div>
                  <p className="text-lg font-semibold">+12% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                System performance and response time statistics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Avg Response Time</span>
                  </div>
                  <p className="text-lg font-semibold text-green-500">124ms</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Cache Hit Rate</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-500">94.2%</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>API Requests/min</span>
                  </div>
                  <p className="text-lg font-semibold">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Maintenance */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Backup & Maintenance
              </CardTitle>
              <CardDescription>
                Backup status and scheduled maintenance information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Last Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Today at 2:00 AM - Successful
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Backup Now
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Next Scheduled Maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      Dec 25, 2025 at 3:00 AM
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Hourly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="daily">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Daily</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Weekly</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Integration Status
              </CardTitle>
              <CardDescription>
                Status of connected services and API integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Service</p>
                    <p className="text-xs text-muted-foreground">SMTP Server</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cloud Storage</p>
                    <p className="text-xs text-muted-foreground">AWS S3</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Database Cluster</p>
                    <p className="text-xs text-muted-foreground">PostgreSQL</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notification Service</p>
                    <p className="text-xs text-muted-foreground">Push Notifications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500">Limited</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Configuration */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Inventory Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings for the inventory management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Retire Assets</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark assets as retired after 4 years.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          <span>USD ($)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="eur">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          <span>EUR (€)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gbp">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          <span>GBP (£)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Maintenance Frequency</Label>
                  <Select defaultValue="6m">
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Every 3 Months</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="6m">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Every 6 Months</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="12m">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Annually</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Apply Config"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
