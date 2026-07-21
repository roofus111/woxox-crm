export const statusLabels: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  disposed: "Disposed",
  archived: "Archived",
  registered: "Registered",
  under_inquiry: "Under Inquiry",
  converted_to_fir: "Converted to FIR",
  closed: "Closed",
  rejected: "Rejected",
  investigation: "Under Investigation",
  chargesheet: "Chargesheet Filed",
  verified: "Verified",
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  listed: "Listed",
  adjourned: "Adjourned",
  part_heard: "Part Heard",
  connected: "Connected",
  degraded: "Degraded",
  offline: "Offline",
  not_configured: "Not Configured",
  checklist: "Checklist",
  filed: "Filed",
  defect: "Defect",
  refiled: "Re-filed",
  registered_filing: "Registered",
  not_applicable: "N/A",
  applied: "Applied",
  granted: "Granted",
  expired: "Expired",
};

export const statusVariant = (
  status: string
): "default" | "success" | "warning" | "destructive" | "outline" | "gold" => {
  const map: Record<string, "default" | "success" | "warning" | "destructive" | "outline" | "gold"> = {
    active: "gold",
    pending: "warning",
    disposed: "default",
    registered: "outline",
    under_inquiry: "warning",
    converted_to_fir: "success",
    closed: "default",
    investigation: "warning",
    chargesheet: "gold",
    verified: "success",
    overdue: "destructive",
    paid: "success",
    sent: "gold",
    critical: "destructive",
    warning: "warning",
    info: "outline",
    connected: "success",
    degraded: "warning",
    offline: "destructive",
    not_configured: "outline",
    listed: "gold",
    adjourned: "warning",
    granted: "success",
    rejected: "destructive",
    applied: "warning",
    filed: "gold",
    defect: "destructive",
  };
  return map[status] ?? "default";
};

export const courtTypeIcon = (court: string) => {
  if (court.includes("Supreme")) return "SC";
  if (court.includes("High")) return "HC";
  return "DC";
};

export const navItems = [
  { href: "/legal/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/legal/cases", label: "Matters", icon: "Briefcase" },
  { href: "/legal/complaints", label: "Complaints", icon: "FileWarning" },
  { href: "/legal/firs", label: "FIR Register", icon: "Shield" },
  { href: "/legal/calendar", label: "Court Calendar", icon: "Calendar" },
  { href: "/legal/evidence", label: "Evidence", icon: "FolderLock" },
  { href: "/legal/filing", label: "Court Filing", icon: "FileStack" },
  { href: "/legal/knowledge", label: "Knowledge Base", icon: "BookOpen" },
  { href: "/legal/research", label: "Research", icon: "Search" },
  { href: "/legal/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/legal/admin/providers", label: "Providers", icon: "Plug" },
  { href: "/legal/clients", label: "Parties (CRM)", icon: "Users" },
  { href: "/legal/billing", label: "Billing (WOXOX)", icon: "Receipt" },
] as const;
