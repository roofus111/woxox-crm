export const FIRM_TITLES = [
  "Managing Partner",
  "Senior Partner",
  "Partner",
  "Senior Associate",
  "Associate",
  "Junior Associate",
  "Litigation Lawyer",
  "Corporate Lawyer",
  "Intern",
  "Law Clerk",
  "Legal Researcher",
  "Paralegal",
  "Recovery",
  "Documentation",
  "Reception",
  "Finance",
  "HR",
  "External Counsel",
] as const;

export const ACCESS_LEVELS = [
  "View Only",
  "View + Comment",
  "Edit",
  "Approve",
  "Delete",
  "Assign",
  "Archive",
  "Export",
  "Print",
  "Billing Access",
  "Evidence Access",
  "Legal Research Access",
  "Administration",
  "Super Admin",
] as const;

export const MATTER_TEAM_ROLES = [
  "Lead Advocate",
  "Co-Counsel",
  "Research Lawyer",
  "Drafting Lawyer",
  "Court Appearance Lawyer",
  "Clerk",
  "Paralegal",
  "Client Relationship Manager",
  "Recovery Officer",
  "Document Controller",
] as const;

export const MODULES = [
  "Matters",
  "Complaints",
  "FIRs",
  "Evidence",
  "Filings",
  "Research",
  "War Room",
  "Analytics",
  "Org Admin",
] as const;

export type Branch = {
  id: string;
  name: string;
  city: string;
  isHeadOffice: boolean;
  staffCount: number;
};

export type FirmStaff = {
  id: string;
  name: string;
  title: string;
  department: string;
  branch: string;
  email: string;
};

export type Appearance = {
  id: string;
  matter: string;
  lawyer: string;
  junior?: string;
  court: string;
  bench: string;
  judge: string;
  time: string;
  travelMins: number;
  status: "Scheduled" | "In Court" | "Completed" | "Adjourned";
  notes?: string;
};

export const mockBranches: Branch[] = [
  { id: "b1", name: "Head Office", city: "Kochi", isHeadOffice: true, staffCount: 28 },
  { id: "b2", name: "Trivandrum Branch", city: "Trivandrum", isHeadOffice: false, staffCount: 12 },
  { id: "b3", name: "Chennai Branch", city: "Chennai", isHeadOffice: false, staffCount: 16 },
  { id: "b4", name: "Bangalore Branch", city: "Bangalore", isHeadOffice: false, staffCount: 14 },
  { id: "b5", name: "Mumbai Branch", city: "Mumbai", isHeadOffice: false, staffCount: 18 },
];

export const mockStaff: FirmStaff[] = [
  {
    id: "s1",
    name: "Adv. Meera Nair",
    title: "Managing Partner",
    department: "Litigation",
    branch: "Kochi",
    email: "meera@demo.law",
  },
  {
    id: "s2",
    name: "Adv. Arjun Menon",
    title: "Senior Partner",
    department: "Corporate",
    branch: "Kochi",
    email: "arjun@demo.law",
  },
  {
    id: "s3",
    name: "Adv. Priya Iyer",
    title: "Senior Associate",
    department: "Litigation",
    branch: "Chennai",
    email: "priya@demo.law",
  },
  {
    id: "s4",
    name: "Rahul Das",
    title: "Law Clerk",
    department: "Documentation",
    branch: "Bangalore",
    email: "rahul@demo.law",
  },
  {
    id: "s5",
    name: "Sneha Joseph",
    title: "Paralegal",
    department: "Recovery",
    branch: "Mumbai",
    email: "sneha@demo.law",
  },
];

export const mockAppearances: Appearance[] = [
  {
    id: "a1",
    matter: "WP(C) 482/2024",
    lawyer: "Adv. Meera Nair",
    junior: "Adv. Priya Iyer",
    court: "Kerala High Court",
    bench: "Court 3",
    judge: "Hon'ble Justice X",
    time: "2026-07-20T10:30:00+05:30",
    travelMins: 45,
    status: "Scheduled",
    notes: "Mention for interim relief",
  },
  {
    id: "a2",
    matter: "CC 118/2023",
    lawyer: "Adv. Arjun Menon",
    court: "Sessions Court, Ernakulam",
    bench: "Court 1",
    judge: "Hon'ble Judge Y",
    time: "2026-07-20T14:00:00+05:30",
    travelMins: 25,
    status: "In Court",
  },
];

export const mockWarRoomFeed = [
  {
    id: "w1",
    type: "Strategy",
    author: "Adv. Meera Nair",
    body: "Primary path: challenge maintainability; secondary: limitation.",
    pinned: true,
    at: "2026-07-18T09:00:00Z",
  },
  {
    id: "w2",
    type: "Argument",
    author: "Adv. Priya Iyer",
    body: "Article 226 writ maintainable — alternative remedy not efficacious.",
    pinned: false,
    at: "2026-07-18T11:20:00Z",
  },
  {
    id: "w3",
    type: "Evidence Note",
    author: "Rahul Das",
    body: "Sealed CCTV clip hash verified; custody chain complete.",
    pinned: false,
    at: "2026-07-19T08:10:00Z",
  },
];

export const mockConflictMatches = [
  {
    name: "State of Delhi",
    reason: "Opposite party in WP(C) 482/2024",
    strength: 92,
  },
  {
    name: "Rajesh Sharma",
    reason: "Existing client — same PAN family cluster",
    strength: 68,
  },
  {
    name: "ABC Infra Pvt Ltd",
    reason: "Director overlap with past representation",
    strength: 54,
  },
];

export const mockGraph = {
  nodes: [
    { id: "c1", label: "Rajesh Sharma", type: "Client" },
    { id: "o1", label: "State of Delhi", type: "Opposite" },
    { id: "f1", label: "FIR 112/2024", type: "FIR" },
    { id: "m1", label: "WP(C) 482/2024", type: "Matter" },
    { id: "a1", label: "Adv. Meera Nair", type: "Advocate" },
    { id: "ps1", label: "Connaught Place PS", type: "Police" },
  ],
  edges: [
    { from: "c1", to: "m1", label: "client" },
    { from: "o1", to: "m1", label: "opposite" },
    { from: "f1", to: "m1", label: "linked" },
    { from: "a1", to: "m1", label: "lead" },
    { from: "ps1", to: "f1", label: "station" },
  ],
};

export const mockTimeline = [
  { date: "2024-01-12", label: "Complaint registered", kind: "Complaint" },
  { date: "2024-02-02", label: "FIR 112/2024", kind: "FIR" },
  { date: "2024-03-18", label: "Charge sheet filed", kind: "Charge Sheet" },
  { date: "2024-06-10", label: "Writ petition filed", kind: "Matter" },
  { date: "2024-08-22", label: "Interim order", kind: "Order" },
  { date: "2026-07-20", label: "Next hearing", kind: "Hearing" },
];

export const mockRiskFindings = [
  { severity: "High", text: "Limitation risk on related civil claim — review by 31 Jul 2026" },
  { severity: "Medium", text: "Witness statement W-3 unsigned" },
  { severity: "Medium", text: "Missing certified copy of order dated 22 Aug 2024" },
  { severity: "Low", text: "Opposing counsel history shows adjournment pattern" },
];

export const mockHearingPrep = {
  summary: "Writ challenging FIR registration and investigation delay.",
  timeline: mockTimeline.slice(0, 4),
  laws: ["Constitution Art. 226", "BNSS ss. 173–193", "CrPC legacy mapping notes"],
  questions: ["Whether alternative remedy bars writ?", "Delay explained?"],
  arguments: ["Maintainability", "Natural justice", "Malafides"],
  weaknesses: ["Incomplete annexures", "No expert affidavit yet"],
  missingDocs: ["Certified FIR", "IO status report"],
};

export const mockTimeEntries = [
  {
    id: "t1",
    matter: "WP(C) 482/2024",
    activity: "Research",
    minutes: 90,
    billable: true,
    when: "2026-07-18",
    by: "Adv. Priya Iyer",
  },
  {
    id: "t2",
    matter: "WP(C) 482/2024",
    activity: "Drafting",
    minutes: 120,
    billable: true,
    when: "2026-07-19",
    by: "Adv. Meera Nair",
  },
  {
    id: "t3",
    matter: "CC 118/2023",
    activity: "Court",
    minutes: 60,
    billable: true,
    when: "2026-07-19",
    by: "Adv. Arjun Menon",
  },
];

export const mockWorkflows = [
  {
    id: "d1",
    title: "Writ petition draft v3",
    matter: "WP(C) 482/2024",
    step: "Senior Associate",
    steps: ["Intern", "Junior Associate", "Senior Associate", "Partner", "Client Approval", "Court Filing"],
  },
  {
    id: "d2",
    title: "Reply affidavit",
    matter: "CC 118/2023",
    step: "Partner",
    steps: ["Intern", "Junior Associate", "Senior Associate", "Partner", "Client Approval", "Court Filing"],
  },
];

export const mockBriefcase = {
  today: ["WP(C) 482/2024 — HC Court 3 — 10:30", "CC 118/2023 — Sessions — 14:00"],
  evidence: ["Sealed CCTV clip", "Medical report PDF"],
  research: ["Maintainability note", "Limitation memo"],
  orders: ["Interim order 22 Aug 2024"],
  contacts: ["Rajesh Sharma (+91…)", "IO — Connaught Place PS"],
};
