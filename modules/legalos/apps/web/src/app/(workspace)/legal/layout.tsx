"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Briefcase,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  FileStack,
  FileWarning,
  FolderOpen,
  Gavel,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Network,
  Scale,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Sun,
  Users,
  Wallet,
  X,
  BarChart3,
  GitBranch,
  ShieldAlert,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LegalAiDrawer } from "@/features/legal/components/LegalAiDrawer";
import { NotificationsBell } from "@/features/legal/components/NotificationsBell";
import { AuthGate } from "@/features/legal/components/AuthGate";
import { useLegalUiStore } from "@/features/legal/stores/legal-ui.store";
import { useAuthStore } from "@/features/legal/stores/auth.store";

const NAV = [
  { href: "/legal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/legal/cases", label: "Matters", icon: Briefcase },
  { href: "/legal/complaints", label: "Complaints", icon: FileWarning },
  { href: "/legal/firs", label: "FIR Register", icon: Shield },
  { href: "/legal/calendar", label: "Court Calendar", icon: CalendarDays },
  { href: "/legal/appearances", label: "Appearances", icon: Gavel },
  { href: "/legal/evidence", label: "Evidence", icon: Scale },
  { href: "/legal/filing", label: "Court Filing", icon: FileStack },
  { href: "/legal/workflows", label: "Doc Workflows", icon: GitBranch },
  { href: "/legal/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/legal/research", label: "Research", icon: Search },
  { href: "/legal/conflict", label: "Conflict Check", icon: ShieldAlert },
  { href: "/legal/briefcase", label: "Briefcase", icon: FolderOpen },
  { href: "/legal/time", label: "Time Tracking", icon: Clock },
  { href: "/legal/org", label: "Firm & Branches", icon: Building2 },
  { href: "/legal/org/rbac", label: "Access Control", icon: Network },
  { href: "/legal/portal", label: "Client Portal", icon: UserCircle2 },
  { href: "/legal/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/legal/admin/providers", label: "Providers", icon: Settings2 },
  { href: "/legal/clients", label: "Parties (CRM)", icon: Users },
  { href: "/legal/billing", label: "Billing (WOXOX)", icon: Wallet },
];

function ToolbarActions({ showLogout }: { showLogout: boolean }) {
  const { theme, setTheme } = useTheme();
  const setAiOpen = useLegalUiStore((s) => s.setAiDrawerOpen);
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="ml-auto flex items-center gap-2">
      {user?.name && (
        <span className="hidden text-xs text-muted-foreground md:inline">{user.name}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => setAiOpen(true)}
      >
        <Sparkles className="h-4 w-4 text-accent" />
        AI Insights
      </Button>
      <NotificationsBell />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="hidden h-4 w-4 dark:block" />
      </Button>
      {showLogout && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => {
            clearSession();
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const embeddedInCrm = useAuthStore((s) => s.embeddedInCrm);

  // Inside WOXOX CRM: module content only (CRM owns nav/chrome)
  if (embeddedInCrm) {
    return (
      <AuthGate>
        <div className="min-h-screen bg-background">
          <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-lg border border-border bg-background/95 p-1 shadow-md backdrop-blur">
            <ToolbarActions showLogout={false} />
          </div>
          <main className="p-4 md:p-6">{children}</main>
          <LegalAiDrawer />
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative border-b border-sidebar-border px-4 py-4">
          <button
            className="absolute right-3 top-3 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <Link href="/legal/dashboard" className="flex flex-col items-center gap-1.5 text-center">
            <Image
              src="/brand/woxox-mark.png"
              alt="WOXOX"
              width={140}
              height={140}
              className="h-16 w-auto object-contain"
              priority
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5C418]">
              LegalOS India
            </p>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-white"
                    : "text-white/65 hover:bg-sidebar-accent/70 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-xs text-white/55">
          Workspace · Demo Law Chambers
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Everything for Indian advocates — inside WOXOX
          </div>
          <ToolbarActions showLogout />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <LegalAiDrawer />
    </div>
    </AuthGate>
  );
}
