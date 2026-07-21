"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useCreateAiRequest } from "../api/hooks";
import type { AiTask } from "../types";
import { useLegalUiStore } from "../stores/legal-ui.store";

const TASKS: { value: AiTask; label: string }[] = [
  { value: "hearing_prep", label: "Hearing prep" },
  { value: "judgment_summary", label: "Judgment summary" },
  { value: "bare_act_explanation", label: "Bare act explanation" },
  { value: "petition_draft", label: "Petition draft" },
  { value: "risk_analysis", label: "Risk analysis" },
  { value: "timeline", label: "Timeline" },
];

export function LegalAiDrawer() {
  const open = useLegalUiStore((s) => s.aiDrawerOpen);
  const setOpen = useLegalUiStore((s) => s.setAiDrawerOpen);
  const [query, setQuery] = useState("");
  const [task, setTask] = useState<AiTask>("hearing_prep");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; review?: boolean }[]>([
    { role: "assistant", text: "LegalOS AI ready. Ask about case strategy, precedents, or drafting." },
  ]);
  const createAiRequest = useCreateAiRequest();

  const handleSend = async () => {
    if (!query.trim() || createAiRequest.isPending) return;
    const prompt = query.trim();
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setQuery("");

    try {
      const result = await createAiRequest.mutateAsync({ task, prompt, redact: true });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: result.result,
          review: result.reviewRequired,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: err instanceof Error ? err.message : "Request failed. Please try again.",
        },
      ]);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-elevated transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-gold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif font-semibold">LegalOS Insights</p>
              <p className="text-xs text-muted-foreground">Research & strategy assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-border px-4 py-2">
          <Select
            value={task}
            onChange={(e) => setTask(e.target.value as AiTask)}
            className="text-sm"
          >
            {TASKS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-muted">
                    <Bot className="h-4 w-4 text-navy dark:text-gold" />
                  </div>
                )}
                <div className="max-w-[85%] space-y-1">
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.review && (
                    <Badge variant="warning" className="text-[10px]">
                      Attorney review required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {createAiRequest.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating response…
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about precedents, strategy, compliance…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={createAiRequest.isPending}
            />
            <Button
              variant="gold"
              size="icon"
              onClick={handleSend}
              disabled={createAiRequest.isPending || !query.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
