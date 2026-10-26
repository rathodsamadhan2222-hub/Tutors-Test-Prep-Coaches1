import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";
import { AppShell, DemoBadge, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatDay, sampleLearners, toISODate } from "@/lib/coach-roster";
import {
  dueLabel,
  followUpStatus,
  summarizeFollowUps,
  type FollowUp,
  type FollowUpStatus,
} from "@/lib/coach-follow-ups";
import { useFollowUps, toggleFollowUp, appendFollowUp } from "@/lib/follow-ups-store";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/coach_/follow-ups")({
  head: () =>
    seo(
      "Coach follow-ups",
      "Every learner follow-up with its topic, due date and status, so coaches know who to call next.",
    ),
  component: FollowUpsPage,
});

const FIELD =
  "mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const LABEL = "text-xs font-bold uppercase tracking-wide text-muted-foreground";

type Filter = "all" | FollowUpStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Overdue", label: "Overdue" },
  { key: "Done", label: "Done" },
];

const STATUS_STYLE: Record<FollowUpStatus, string> = {
  Pending: "bg-warn-soft text-foreground",
  Overdue: "bg-destructive-soft text-foreground",
  Done: "bg-success-soft text-foreground",
};

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toISODate(d);
}

function FollowUpsPage() {
  const followUps = useFollowUps();
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [learnerId, setLearnerId] = useState(() => sampleLearners()[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const summary = summarizeFollowUps(followUps);
  const shown = followUps.filter(
    (f) => filter === "all" || followUpStatus(f) === filter,
  );

  function handleAddFollowUp(e: FormEvent) {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Enter the topic to follow up on.");
      return;
    }
    if (!dueDate) {
      setError("Pick a due date.");
      return;
    }
    const learner = sampleLearners().find((l) => l.id === learnerId);
    appendFollowUp({
      id: `fu-${Date.now()}`,
      learnerId,
      learnerName: learner?.name ?? "New learner",
      exam: learner?.exam ?? "Not set",
      topic: trimmedTopic,
      dueDate,
      done: false,
    });
    setTopic("");
    setDueDate(defaultDueDate());
    setError(null);
    setNotice(`Follow-up added for ${learner?.name ?? "this learner"}.`);
    setAdding(false);
  }

  function handleToggleFollowUp(id: string) {
    const item = followUps.find((f) => f.id === id);
    if (!item) return;
    toggleFollowUp(id);
    const nextDone = !item.done;
    setNotice(`Follow-up for ${item.learnerName} marked ${nextDone ? "Done" : "Pending"}.`);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Independent tutors / test-prep coaches"
        title="Follow-ups"
        description="Every coach check-in with its learner, topic, due date and status — so nothing slips between sessions."
        actions={
          <>
            <Button
              variant="hero"
              onClick={() => {
                setAdding((v) => !v);
                setError(null);
                setNotice(null);
              }}
              aria-expanded={adding}
              aria-controls="new-follow-up-form"
            >
              <Plus /> New follow-up
            </Button>
            <Button asChild variant="outline">
              <Link to="/coach">
                Coach roster <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DemoBadge />
        <p className="text-xs text-muted-foreground">
          Illustrative follow-ups · new items stay in this page only. Nothing is saved to a backend.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: CircleDashed, label: "Total follow-ups", value: String(summary.total) },
          { icon: Clock3, label: "Pending", value: String(summary.pending) },
          { icon: TriangleAlert, label: "Overdue", value: String(summary.overdue) },
          { icon: CheckCircle2, label: "Done", value: String(summary.done) },
        ].map((m) => (
          <div key={m.label} className="card-surface p-4">
            <m.icon className="size-5 text-brand" />
            <p className="mt-3 text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {adding && (
        <form
          id="new-follow-up-form"
          onSubmit={handleAddFollowUp}
          className="card-surface mt-6 p-5"
          aria-label="New follow-up"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">New follow-up</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sample entry only — this prototype has no backend.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              aria-label="Close new follow-up form"
              className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-sidebar-accent"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="followup-learner" className={LABEL}>
                Learner
              </label>
              <select
                id="followup-learner"
                value={learnerId}
                onChange={(e) => setLearnerId(e.target.value)}
                className={FIELD}
              >
                {sampleLearners().map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.exam}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="followup-topic" className={LABEL}>
                Topic
              </label>
              <input
                id="followup-topic"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Genetics practice gaps"
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="followup-due" className={LABEL}>
                Due date
              </label>
              <input
                id="followup-due"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setError(null);
                }}
                className={FIELD}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-sm font-medium text-foreground">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" variant="ink">
              Save follow-up
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {notice && (
        <p className="mt-6 flex flex-wrap items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden />
          {notice}
          <button type="button" onClick={() => setNotice(null)} className="ml-auto text-xs font-bold underline">
            Dismiss
          </button>
        </p>
      )}

      <section className="mt-8" aria-labelledby="follow-up-list">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="follow-up-list" className="text-xl font-bold">
            Follow-up tasks
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter follow-ups">
            {FILTERS.map((f) => {
              const count =
                f.key === "all"
                  ? summary.total
                  : f.key === "Pending"
                    ? summary.pending
                    : f.key === "Overdue"
                      ? summary.overdue
                      : summary.done;
              return (
                <Button
                  key={f.key}
                  size="sm"
                  variant={filter === f.key ? "ink" : "outline"}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-sm font-semibold">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No {filter === "all" ? "follow-ups" : filter.toLowerCase()} follow-ups right now.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setFilter("all")}>
              Show all follow-ups
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3" aria-label="Follow-up tasks">
            {shown.map((f) => {
              const status = followUpStatus(f);
              return (
                <li key={f.id} className="card-surface overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => handleToggleFollowUp(f.id)}
                    aria-label={`Toggle follow-up for ${f.learnerName} · ${f.topic} between Pending and Done`}
                    className={cn(
                      "flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-sidebar-accent",
                    )}
                  >
                    <span className="mt-0.5 shrink-0">
                      {status === "Done" ? (
                        <CheckCircle2 className="size-5 text-brand" aria-hidden />
                      ) : status === "Overdue" ? (
                        <TriangleAlert className="size-5 text-destructive" aria-hidden />
                      ) : (
                        <CalendarClock className="size-5 text-warn" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{f.topic}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {f.learnerName} · {f.exam}
                      </span>
                      <span className="mt-2 block text-xs text-muted-foreground">
                        {dueLabel(f.dueDate)} · {formatDay(f.dueDate)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        STATUS_STYLE[status],
                      )}
                    >
                      {status}
                    </span>
                  </button>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2">
                    <Link
                      to="/coach/learner/$id"
                      params={{ id: f.learnerId }}
                      className="text-xs font-bold text-brand underline underline-offset-2"
                    >
                      View {f.learnerName}'s details
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {f.done ? "Click to mark Pending" : "Click to mark Done"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 border-t pt-6" aria-labelledby="follow-up-links">
        <h2 id="follow-up-links" className="text-lg font-bold">
          Where to next
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/coach">Coach roster</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Coach workspace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/plan">Learner study plan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/practice">Practice questions</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
