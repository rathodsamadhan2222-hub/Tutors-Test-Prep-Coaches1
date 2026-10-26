import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Plus,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AppShell, DemoBadge, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { COMMON_EXAMS, daysUntil, usePrep } from "@/lib/prep-store";
import { STARTER_LEARNER_LIMIT, MONTHLY_PRICE, inr, needsProForNewLearner } from "@/lib/premium-plans";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  formatDay,
  sampleLearners,
  summarizeRoster,
  toISODate,
  type Learner,
} from "@/lib/coach-roster";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/coach")({
  head: () =>
    seo(
      "Coach roster",
      "Every learner's exam countdown, plan progress, current weak topic and follow-up status in one coach-facing roster.",
    ),
  component: CoachRoster,
});

const NEW_LEARNER_DAYS = 90;
const FIELD =
  "mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function CoachRoster() {
  const [learners, setLearners] = useState<Learner[]>(() => sampleLearners());
  const [onlyFollowUps, setOnlyFollowUps] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [exam, setExam] = useState<string>(COMMON_EXAMS[0] ?? "JEE Main");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const { plan } = usePrep();

  const summary = summarizeRoster(learners);
  const shown = onlyFollowUps ? learners.filter((l) => l.followUp !== null) : learners;

  function addLearner(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter the learner's name.");
      return;
    }
    if (learners.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`${trimmed} is already in this roster.`);
      return;
    }
    const today = new Date();
    const examDate = new Date(today);
    examDate.setDate(examDate.getDate() + NEW_LEARNER_DAYS);
    setLearners((prev) => [
      ...prev,
      {
        id: `learner-${prev.length + 1}`,
        name: trimmed,
        exam,
        examDate: toISODate(examDate),
        progress: 0,
        weakTopic: "Not assessed yet",
        lastActive: toISODate(today),
        followUp: "Set the first weekly plan",
      },
    ]);
    setName("");
    setError(null);
    setNotice(`${trimmed} added — assign their first weekly plan.`);
    setAdding(false);
    setOnlyFollowUps(false);
  }

  function completeFollowUp(id: string) {
    const learner = learners.find((l) => l.id === id);
    setLearners((prev) => prev.map((l) => (l.id === id ? { ...l, followUp: null } : l)));
    if (learner) setNotice(`Follow-up logged for ${learner.name}.`);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Independent tutors / test-prep coaches"
        title="Coach roster"
        description="Every learner's exam countdown, plan progress, weak topic and follow-up status in one place."
        actions={
          <>
            <Button
              variant="hero"
              onClick={() => {
                if (!adding && needsProForNewLearner(plan, learners.length)) { setLimitOpen(true); return; }
                setAdding((v) => !v);
                setError(null);
                setNotice(null);
              }}
              aria-expanded={adding}
              aria-controls="add-learner-form"
            >
              <Plus /> Add learner
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Open coach workspace <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Starter includes up to {STARTER_LEARNER_LIMIT} learners</DialogTitle>
            <DialogDescription>
              You have {learners.length} learners in this workspace. Upgrade to Pro for unlimited learners, mock tests and advanced insights — from {inr(MONTHLY_PRICE)}/month. Demo only: no payment is processed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLimitOpen(false)}>Continue on Starter</Button>
            <Button asChild variant="hero"><Link to="/premium">See Pro plan <ArrowRight /></Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DemoBadge />
        <p className="text-xs text-muted-foreground">
          Illustrative roster · sample progress, weak topics and follow-ups. Nothing is saved to a backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Total learners", value: String(summary.total), detail: "In this workspace" },
          {
            icon: CalendarClock,
            label: "Needing follow-up",
            value: String(summary.needingFollowUp),
            detail: "Pending coach check-ins",
          },
          {
            icon: TrendingUp,
            label: "Average progress",
            value: `${summary.averageProgress}%`,
            detail: "Across all assigned plans",
          },
        ].map((m) => (
          <div key={m.label} className="card-surface p-4 sm:p-5">
            <m.icon className="size-5 text-brand" />
            <p className="mt-3 text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-2xl font-bold">{m.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.detail}</p>
          </div>
        ))}
      </div>

      {adding && (
        <form
          id="add-learner-form"
          onSubmit={addLearner}
          className="card-surface mt-6 p-5"
          aria-label="Add a learner"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Add a learner</h2>
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
              aria-label="Close add learner form"
              className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-sidebar-accent"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="learner-name" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Learner name
              </label>
              <input
                id="learner-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Ishita"
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="learner-exam" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Exam
              </label>
              <select id="learner-exam" value={exam} onChange={(e) => setExam(e.target.value)} className={FIELD}>
                {COMMON_EXAMS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-sm font-medium text-foreground">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" variant="ink">
              Add to roster
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

      <section className="mt-8" aria-labelledby="roster">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="roster" className="text-xl font-bold">
            Learners
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter learners">
            <Button size="sm" variant={onlyFollowUps ? "outline" : "ink"} aria-pressed={!onlyFollowUps} onClick={() => setOnlyFollowUps(false)}>
              All ({summary.total})
            </Button>
            <Button size="sm" variant={onlyFollowUps ? "ink" : "outline"} aria-pressed={onlyFollowUps} onClick={() => setOnlyFollowUps(true)}>
              Needs follow-up ({summary.needingFollowUp})
            </Button>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-sm font-semibold">No follow-ups pending</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every learner is caught up. Switch back to see all {summary.total} learners.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setOnlyFollowUps(false)}>
              Show all learners
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((l) => (
              <LearnerCard key={l.id} learner={l} onCompleteFollowUp={completeFollowUp} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 border-t pt-6" aria-labelledby="coach-links">
        <h2 id="coach-links" className="text-lg font-bold">
          Where to next
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard">Coach workspace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/coach/follow-ups">Follow-ups</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/plan">Learner study plan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/practice">Practice questions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/premium">Premium plans</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}

function LearnerCard({
  learner,
  onCompleteFollowUp,
}: {
  learner: Learner;
  onCompleteFollowUp: (id: string) => void;
}) {
  const days = daysUntil(learner.examDate);
  const urgent = days <= 30;
  return (
    <li className="card-surface flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-accent-foreground">
          {learner.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-bold"><Link to="/coach/learner/$id" params={{ id: learner.id }} state={{ coachLearner: learner }} className="hover:text-brand hover:underline">{learner.name}</Link></h3>
          <p className="text-xs text-muted-foreground">{learner.exam}</p>
        </div>
        {learner.followUp !== null && (
          <span className="ml-auto shrink-0 rounded-full bg-warn-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
            Follow-up due
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className={cn("flex items-center gap-1.5 text-sm font-semibold", urgent && "text-warn")}>
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          {days} days to exam
        </p>
        <p className="text-xs text-muted-foreground">Last active {formatDay(learner.lastActive)}</p>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Plan progress</span>
          <span className="font-bold">{learner.progress}%</span>
        </div>
        <progress
          aria-label={`${learner.name} plan progress`}
          value={learner.progress}
          max={100}
          className="mt-1 h-2 w-full accent-brand"
        />
      </div>

      <dl className="mt-4 text-sm">
        <dt className="text-muted-foreground">Current weak topic</dt>
        <dd className="mt-1 font-semibold text-warn">{learner.weakTopic}</dd>
      </dl>

      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link to="/coach/learner/$id" params={{ id: learner.id }} state={{ coachLearner: learner }} aria-label={`View ${learner.name}'s details`}>View learner <ArrowRight /></Link>
      </Button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        {learner.followUp !== null ? (
          <>
            <p className="min-w-0 flex-1 text-xs text-muted-foreground">{learner.followUp}</p>
            <Button size="sm" variant="outline" onClick={() => onCompleteFollowUp(learner.id)}>
              Mark follow-up done
            </Button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No follow-up pending · next review in 7 days</p>
        )}
      </div>
    </li>
  );
}
