"use client";

import { useState } from "react";
import {
  useBookmarkKnowledge,
  useCreateKnowledge,
  useKnowledge,
  useUpdateKnowledge,
} from "@/features/legal/api/hooks";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { Bookmark, BookmarkCheck, BookOpen, Pencil, Plus, Search } from "lucide-react";
import type { KnowledgeCategory, KnowledgeDoc } from "@/features/legal/types";

const CATEGORIES: { value: KnowledgeCategory; label: string }[] = [
  { value: "template", label: "Template" },
  { value: "act", label: "Act" },
  { value: "rule", label: "Rule" },
  { value: "circular", label: "Circular" },
  { value: "notification", label: "Notification" },
  { value: "sop", label: "SOP" },
  { value: "draft", label: "Draft" },
];

type DocForm = { title: string; category: string; body: string; tags: string };

const emptyForm = (): DocForm => ({ title: "", category: "template", body: "", tags: "" });

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | null>(null);
  const [form, setForm] = useState<DocForm>(emptyForm());

  const { data, isLoading } = useKnowledge({
    search: search.trim() || undefined,
    category: category || undefined,
  });
  const createKnowledge = useCreateKnowledge();
  const updateKnowledge = useUpdateKnowledge();
  const bookmark = useBookmarkKnowledge();
  const docs = data?.data ?? [];

  const openEdit = (doc: KnowledgeDoc) => {
    setEditDoc(doc);
    setForm({
      title: doc.title,
      category: doc.category,
      body: doc.body,
      tags: doc.tags.join(", "),
    });
  };

  const parseTags = (raw: string) =>
    raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createKnowledge.mutateAsync({
      title: form.title.trim(),
      category: form.category,
      body: form.body.trim(),
      tags: parseTags(form.tags),
    });
    setCreateOpen(false);
    setForm(emptyForm());
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;
    await updateKnowledge.mutateAsync({
      id: editDoc.id,
      title: form.title.trim(),
      category: form.category,
      body: form.body.trim(),
      tags: parseTags(form.tags),
    });
    setEditDoc(null);
    setForm(emptyForm());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            Templates, acts, SOPs — firm knowledge memory for reuse with AI assistance
          </p>
        </div>
        <Button
          variant="gold"
          onClick={() => {
            setForm(emptyForm());
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, body, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="sm:w-44"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading knowledge base…</p>
      ) : docs.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Add a document or adjust your search filters."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-gold">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {doc.category} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit document"
                    onClick={() => openEdit(doc)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={doc.bookmarked ? "Remove bookmark" : "Bookmark"}
                    onClick={() => bookmark.mutate(doc.id)}
                    disabled={bookmark.isPending}
                  >
                    {doc.bookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-accent" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{doc.body}</p>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent onClose={() => setCreateOpen(false)} className="max-w-xl">
          <form onSubmit={handleCreate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Knowledge Document</DialogTitle>
              <DialogDescription>
                Store templates, acts, or internal SOPs for the team.
              </DialogDescription>
            </DialogHeader>
            <KnowledgeFormFields form={form} setForm={setForm} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={createKnowledge.isPending}>
                {createKnowledge.isPending ? "Saving…" : "Save Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editDoc}
        onOpenChange={(open) => {
          if (!open) {
            setEditDoc(null);
            setForm(emptyForm());
          }
        }}
      >
        <DialogContent
          onClose={() => {
            setEditDoc(null);
            setForm(emptyForm());
          }}
          className="max-w-xl"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
              <DialogDescription>Update title, category, body, or tags.</DialogDescription>
            </DialogHeader>
            <KnowledgeFormFields form={form} setForm={setForm} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDoc(null);
                  setForm(emptyForm());
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={updateKnowledge.isPending}>
                {updateKnowledge.isPending ? "Saving…" : "Update Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KnowledgeFormFields({
  form,
  setForm,
}: {
  form: DocForm;
  setForm: React.Dispatch<React.SetStateAction<DocForm>>;
}) {
  return (
    <div className="grid gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Title</label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Body</label>
        <textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          required
          rows={5}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
        <Input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="writ, delhi-hc"
        />
      </div>
    </div>
  );
}
