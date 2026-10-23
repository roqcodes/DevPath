"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { value: "bug", label: "Bug" },
  { value: "content", label: "Incorrect lesson content" },
  { value: "judge", label: "Judge or problem issue" },
  { value: "usability", label: "Usability suggestion" },
  { value: "other", label: "Other" },
] as const;

export function BetaFeedbackForm({
  lessonId,
  problemId,
}: {
  lessonId?: string;
  problemId?: string;
}) {
  const pathname = usePathname();
  const [category, setCategory] = useState<string>("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          contextPath: pathname,
          lessonId,
          problemId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send feedback");
        setStatus("error");
        return;
      }
      setMessage("");
      setStatus("sent");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Reports are private to your account. We store category, message, and page path only — no extra personal data.
      </p>
      <div className="space-y-1">
        <Label htmlFor="feedback-category">Category</Label>
        <select
          id="feedback-category"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="feedback-message">Message (10–2000 characters)</Label>
        <textarea
          id="feedback-message"
          className="w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      {status === "sent" && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          Thank you — your report was saved.
        </p>
      )}
      <Button type="submit" disabled={status === "sending" || message.trim().length < 10}>
        {status === "sending" ? "Sending…" : "Send beta feedback"}
      </Button>
    </form>
  );
}
