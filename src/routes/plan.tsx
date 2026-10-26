import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Clock, AlertTriangle, CalendarDays, Target, RotateCcw } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { daysUntil, generatePlan, profileOrDemo, setState, usePrep } from "@/lib/prep-store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  head: () => seo("Coach-assigned learner plan", "A connected learner view of the 7-day, 21-task preparation plan with subjects, topics and time estimates."),
  component: PlanPage,
});

const DAY_LABEL = (d: number) => {
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

function PlanPage() {
  const s = usePrep();
  const p = profileOrDemo(s.profile);
  const tasks = useMemo(() => generatePlan(p), [p.exam, p.examDate, p.hours, p.level]);
  const [day, setDay] = useState(0);
  const dayTasks = tasks.filter((t) => t.day === day);
  const doneCount = tasks.filter((t) => s.done[t.id]).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const dayMin = dayTasks.reduce((a, t) => a + t.minutes, 0);
  const toggle = (id: string) => setState((st) => ({ done: { ...st.done, [id]: !st.done[id] } }));

  return (
    <AppShell>
      <PageHeader
        eyebrow={`${p.exam} · ${daysUntil(p.examDate)} days to go`}
        title={`${p.name}'s assigned study plan`}
        description={`7 days · 3 tasks per day · Exam ${p.examDate} · ${p.hours}h/day · ${p.level} level. Rule-based weak topics get extra time; practice results do not replan tasks.`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/onboarding"><RotateCcw /> Edit inputs</Link></Button>
            <Button asChild variant="hero"><Link to="/dashboard">Coach workspace</Link></Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={CalendarDays} label="This week" value={`${doneCount}/${tasks.length} tasks`} />
        <Stat icon={Clock} label={`${DAY_LABEL(day)}'s load`} value={`${Math.floor(dayMin / 60)}h ${dayMin % 60}m`} />
        <div className="card-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">Week progress</p>
          <p className="mt-1 text-2xl font-bold">{pct}%</p>
          <div className="mt-3 h-2 rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Week progress">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Choose day">
        {Array.from({ length: 7 }, (_, d) => {
          const dt = tasks.filter((t) => t.day === d);
          const all = dt.every((t) => s.done[t.id]);
          return (
            <button key={d} role="tab" aria-selected={day === d} onClick={() => setDay(d)}
              className={cn("flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                day === d ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-foreground/30")}>
              {all && <Check className="size-3.5" aria-label="completed" />}
              {DAY_LABEL(d)}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-3">
        {dayTasks.map((t) => {
          const done = !!s.done[t.id];
          return (
            <li key={t.id} className={cn("card-surface flex items-center gap-4 p-4 transition sm:p-5", done && "opacity-70")}>
              <button onClick={() => toggle(t.id)} role="checkbox" aria-checked={done} aria-label={`Mark ${t.topic} ${done ? "not done" : "done"}`}
                className={cn("grid size-7 shrink-0 place-items-center rounded-lg border-2 transition", done ? "border-brand bg-brand text-primary-foreground" : "border-input hover:border-brand")}>
                {done && <Check className="size-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t.subject}</span>
                  <span className="text-xs font-medium text-muted-foreground">{t.kind}</span>
                  {t.weak && <span className="inline-flex items-center gap-1 rounded-md bg-warn-soft px-2 py-0.5 text-[11px] font-bold text-warn"><AlertTriangle className="size-3" /> Weak topic +10m</span>}
                </div>
                <p className={cn("mt-1 font-semibold", done && "line-through")}>{t.topic}</p>
              </div>
              <span className="hidden items-center gap-1 text-sm font-semibold text-muted-foreground sm:flex"><Clock className="size-4" /> {t.minutes} min</span>
              {t.kind === "Practice" && (
                <Button asChild variant="outline" size="sm"><Link to="/practice"><Target /> <span className="hidden sm:inline">Practice</span></Link></Button>
              )}
            </li>
          );
        })}
      </ul>
      {dayTasks.length > 0 && dayTasks.every((t) => s.done[t.id]) && (
        <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success" role="status">
          Nice work — {DAY_LABEL(day).toLowerCase()} is complete. 🎉
        </p>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-accent-foreground"><Icon className="size-5" /></span>
      <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>
    </div>
  );
}
