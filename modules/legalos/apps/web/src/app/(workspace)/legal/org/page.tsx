"use client";

import { useEffect, useState } from "react";
import {
  useBranches,
  useCreateBranch,
  useMembers,
  useUpsertMember,
  slugCode,
} from "@/features/legal/api";
import {
  FIRM_TITLES,
  mockBranches,
  mockStaff,
  type Branch,
  type FirmStaff,
} from "@/features/legal/utils/enterprise-mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Plus, Users } from "lucide-react";

export default function FirmOrganizationPage() {
  const { data: branchesData } = useBranches();
  const { data: membersData } = useMembers();
  const createBranch = useCreateBranch();
  const upsertMember = useUpsertMember();

  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [staff, setStaff] = useState<FirmStaff[]>(mockStaff);
  const [branchOpen, setBranchOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "", city: "" });
  const [staffForm, setStaffForm] = useState<{
    name: string;
    title: string;
    department: string;
    branch: string;
    email: string;
  }>({
    name: "",
    title: FIRM_TITLES[0],
    department: "",
    branch: "",
    email: "",
  });

  useEffect(() => {
    if (branchesData) setBranches(branchesData);
  }, [branchesData]);

  useEffect(() => {
    if (membersData) setStaff(membersData);
  }, [membersData]);

  const addBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = branchForm.name.trim();
    const city = branchForm.city.trim();
    try {
      const created = await createBranch.mutateAsync({
        name,
        code: slugCode(name),
        city,
        isHeadOffice: false,
      });
      setBranches((prev) => [...prev, created]);
    } catch {
      const next: Branch = {
        id: `b${Date.now()}`,
        name,
        city,
        isHeadOffice: false,
        staffCount: 0,
      };
      setBranches((prev) => [...prev, next]);
    }
    setBranchForm({ name: "", city: "" });
    setBranchOpen(false);
  };

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = staffForm.email.trim() || staffForm.name.trim();
    const matchedBranch = branches.find(
      (b) => b.name.toLowerCase() === staffForm.branch.trim().toLowerCase() ||
        b.city.toLowerCase() === staffForm.branch.trim().toLowerCase()
    );
    try {
      const created = await upsertMember.mutateAsync({
        userId,
        title: staffForm.title,
        department: staffForm.department.trim() || "GENERAL",
        branchId: matchedBranch?.id,
      });
      setStaff((prev) => [
        ...prev,
        {
          ...created,
          name: staffForm.name.trim() || created.name,
          branch: staffForm.branch.trim() || created.branch,
          email: staffForm.email.trim() || created.email,
        },
      ]);
    } catch {
      const next: FirmStaff = {
        id: `s${Date.now()}`,
        name: staffForm.name.trim(),
        title: staffForm.title,
        department: staffForm.department.trim(),
        branch: staffForm.branch.trim(),
        email: staffForm.email.trim(),
      };
      setStaff((prev) => [...prev, next]);
    }
    setStaffForm({
      name: "",
      title: FIRM_TITLES[0],
      department: "",
      branch: "",
      email: "",
    });
    setStaffOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Firm Organization</h1>
        <p className="text-sm text-muted-foreground">
          Branches and staff across the firm
        </p>
      </div>

      <Tabs defaultValue="branches">
        <TabsList>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" onClick={() => setBranchOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </div>
          {branches.length === 0 ? (
            <EmptyState title="No branches" description="Add a branch to get started." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((b) => (
                <Card key={b.id}>
                  <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{b.name}</CardTitle>
                    </div>
                    {b.isHeadOffice && <Badge variant="gold">Head Office</Badge>}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {b.city}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {b.staffCount} staff
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" onClick={() => setStaffOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </div>
          {staff.length === 0 ? (
            <EmptyState title="No staff" description="Add a staff member to get started." />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Dept</th>
                      <th className="px-4 py-3 font-medium">Branch</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3">{s.title}</td>
                        <td className="px-4 py-3">{s.department}</td>
                        <td className="px-4 py-3">{s.branch}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={branchOpen} onOpenChange={setBranchOpen}>
        <DialogContent onClose={() => setBranchOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
            <DialogDescription>Create a new firm branch locally.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addBranch} className="space-y-3">
            <Input
              placeholder="Branch name"
              value={branchForm.name}
              onChange={(e) => setBranchForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder="City"
              value={branchForm.city}
              onChange={(e) => setBranchForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBranchOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={createBranch.isPending}>
                Add Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={staffOpen} onOpenChange={setStaffOpen}>
        <DialogContent onClose={() => setStaffOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Staff</DialogTitle>
            <DialogDescription>Add a staff member locally.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addStaff} className="space-y-3">
            <Input
              placeholder="Full name"
              value={staffForm.name}
              onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Select
              value={staffForm.title}
              onChange={(e) => setStaffForm((f) => ({ ...f, title: e.target.value }))}
            >
              {FIRM_TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Department"
              value={staffForm.department}
              onChange={(e) => setStaffForm((f) => ({ ...f, department: e.target.value }))}
              required
            />
            <Input
              placeholder="Branch"
              value={staffForm.branch}
              onChange={(e) => setStaffForm((f) => ({ ...f, branch: e.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={staffForm.email}
              onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStaffOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={upsertMember.isPending}>
                Add Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
