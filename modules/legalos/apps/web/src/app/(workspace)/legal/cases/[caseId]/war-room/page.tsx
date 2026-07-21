"use client";

import { use, useEffect, useState } from "react";
import { Lock, Pin, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateWarRoomEntry, useWarRoom } from "@/features/legal/api";
import { CaseEnterpriseNav } from "@/features/legal/components/CaseEnterpriseNav";
import { mockWarRoomFeed } from "@/features/legal/utils/enterprise-mock";

type FeedItem = (typeof mockWarRoomFeed)[number];

const POST_TYPES = ["Strategy", "Argument", "Counter", "Evidence Note", "Witness", "Links"] as const;

const BOARD_COLUMNS: { title: string; types: string[] }[] = [
  { title: "Arguments", types: ["Argument"] },
  { title: "Counter", types: ["Counter"] },
  { title: "Evidence", types: ["Evidence Note"] },
  { title: "Witness", types: ["Witness"] },
  { title: "Links", types: ["Links"] },
];

export default function WarRoomPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { data: warRoomData } = useWarRoom(caseId);
  const createEntry = useCreateWarRoomEntry();

  const [feed, setFeed] = useState<FeedItem[]>([...mockWarRoomFeed]);
  const [postType, setPostType] = useState<string>("Argument");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (warRoomData) setFeed(warRoomData);
  }, [warRoomData]);

  const handlePost = async () => {
    if (!body.trim()) return;
    const text = body.trim();
    try {
      const created = await createEntry.mutateAsync({
        caseId,
        type: postType,
        body: text,
      });
      setFeed((prev) => [created, ...prev]);
    } catch {
      setFeed((prev) => [
        {
          id: `w-local-${Date.now()}`,
          type: postType,
          author: "You",
          body: text,
          pinned: false,
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setBody("");
  };

  return (
    <div className="space-y-6">
      <CaseEnterpriseNav caseId={caseId} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Litigation War Room</h1>
          <p className="text-sm text-muted-foreground">Matter {caseId}</p>
        </div>
        <Badge variant="warning" className="gap-1">
          <Lock className="h-3 w-3" />
          Authorized members only
        </Badge>
      </div>

      <Tabs defaultValue="discussion">
        <TabsList>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="discussion" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feed.map((item) => (
                  <div key={item.id} className="rounded-md border border-border p-3">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{item.author}</span>
                      <Badge variant="outline">{item.type}</Badge>
                      {item.pinned && (
                        <Badge variant="gold" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{item.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="font-serif text-lg font-semibold">Strategy board</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {BOARD_COLUMNS.map((col) => {
                  const items = feed.filter((f) => col.types.includes(f.type));
                  return (
                    <Card key={col.title}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{col.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No items</p>
                        ) : (
                          items.map((item) => (
                            <p key={item.id} className="rounded bg-muted/50 p-2 text-xs">
                              {item.body}
                            </p>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Composer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={postType} onChange={(e) => setPostType(e.target.value)}>
                {POST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Post to the war room…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button onClick={handlePost} disabled={!body.trim() || createEntry.isPending}>
                <Send className="mr-2 h-4 w-4" />
                Post
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-5 text-sm text-muted-foreground">
              Private notes workspace — attach hearing notes here.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="research">
          <Card>
            <CardContent className="pt-5 text-sm text-muted-foreground">
              Research pins and memo drafts for this matter.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="meetings">
          <Card>
            <CardContent className="pt-5 text-sm text-muted-foreground">
              Strategy huddles and chamber conferences.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
