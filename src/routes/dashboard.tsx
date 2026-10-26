import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Users, CalendarCheck, MessageCircle, ArrowRight, Target, Check } from "lucide-react";
import { AppShell, DemoBadge, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { daysUntil, generatePlan, profileOrDemo, setState, usePrep, type Profile } from "@/lib/prep-store";
import { sampleLearners, summarizeDemoFollowUps } from "@/lib/coach-demo";
import { useFollowUpSummary } from "@/lib/follow-ups-store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => seo("Coach workspace", "A test-prep coach's sample learner roster, assigned weekly plans, practice gaps and next follow-ups."),
  component: Dashboard,
});

function Dashboard() {
  const s = usePrep();
  const p = profileOrDemo(s.profile);
  const learners = sampleLearners(p);
  const followUps = summarizeDemoFollowUps(learners);
  const liveFollowUps = useFollowUpSummary();
  const nav = useNavigate();
  const tasks = generatePlan(p);
  const completed = tasks.filter(t => s.done[t.id]).length;
  const score = s.answered ? `${Math.round(s.correct / s.answered * 100)}%` : "Not attempted";
  const today = tasks.filter(t => t.day === 0);
  function openLearner(profile: Profile, to: "/plan" | "/practice") {
    if (profile !== p) setState({ profile, done: {}, answered: 0, correct: 0, sessionsCompleted: 0 });
    else if (!s.profile) setState({ profile });
    nav({ to });
  }

  return <AppShell>
    <PageHeader eyebrow="Independent tutors / test-prep coaches" title="Your coaching workspace" description="Assigned plans, learner practice gaps and your next follow-ups — together in one place." actions={<Button asChild variant="hero"><Link to="/onboarding">Create learner plan <ArrowRight /></Link></Button>} />
    <div className="mb-6 flex flex-wrap items-center gap-3"><DemoBadge /><p className="text-xs text-muted-foreground">Illustrative learner roster · {p.name}'s plan and practice reflect this browser's activity.</p></div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[{ icon: Users, label: "Sample learners", value: "6", detail: "3 previewed below" }, { icon: CalendarCheck, label: "Plans assigned", value: "3", detail: "7 days · 3 tasks per day" }, { icon: MessageCircle, label: "Next follow-ups", value: `${liveFollowUps.pending} pending`, detail: `${liveFollowUps.overdue} overdue` }, { icon: Target, label: "Aarav's practice (sample learner)", value: score, detail: `${s.answered} questions answered` }].map(m => <div key={m.label} className="card-surface p-4 sm:p-5"><m.icon className="size-5 text-brand" /><p className="mt-3 text-xs text-muted-foreground">{m.label}</p><p className="mt-1 text-xl font-bold">{m.value}</p><p className="mt-1 text-xs text-muted-foreground">{m.detail}</p></div>)}
    </div>
    <section className="mt-8" aria-labelledby="learners">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 id="learners" className="text-xl font-bold">Learner roster</h2><div className="flex flex-wrap items-center gap-3"><span className="text-xs text-muted-foreground">Weekly plan progress</span><Link to="/coach" className="text-xs font-bold text-brand underline underline-offset-4">Open full roster (6 learners) <ArrowRight className="inline size-3" aria-hidden /></Link></div></div>
      <div className="grid gap-4 xl:grid-cols-3">{learners.map(l => {
        const progress = l.progress ?? completed;
        return <article key={l.id} className="card-surface flex flex-col p-5">
          <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-accent-foreground">{l.profile.name.charAt(0)}</span><div><h3 className="font-bold">{l.profile.name}</h3><p className="text-xs text-muted-foreground">{l.profile.exam} · {daysUntil(l.examDate)} days left</p></div></div>
          <p className="mt-4 text-sm font-semibold">{progress}/21 tasks complete</p><progress aria-label={`${l.profile.name} weekly progress`} value={progress} max={21} className="mt-2 h-2 w-full accent-brand" />
          <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-2"><dt className="text-muted-foreground">Practice</dt><dd className="font-semibold">{l.score === null ? score : `${l.score}% (sample)`}</dd></div><div><dt className="text-muted-foreground">Needs attention</dt><dd className="mt-1 font-semibold text-warn">{l.weak}</dd></div></dl>
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Assigned: 7-day plan · {l.profile.hours}h/day · {l.profile.level}</p>
          <Button variant="outline" className="mt-4 w-full" onClick={() => openLearner(l.profile, "/plan")}>Open {l.profile.name}'s plan <ArrowRight /></Button>
        </article>;
      })}</div>
    </section>
    <section className="mt-8" aria-labelledby="followups"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 id="followups" className="text-xl font-bold">Next follow-ups</h2><Link to="/coach/follow-ups" className="text-xs font-bold text-brand underline underline-offset-4">Open all follow-ups <ArrowRight className="inline size-3" aria-hidden /></Link></div><ul className="divide-y border-y">{followUps.shown.map(l => <li key={l.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">{l.profile.name} · {l.followUp}</p><p className="mt-1 text-xs text-muted-foreground">{l.due} · Coach review</p></div><Button variant="ghost" onClick={() => openLearner(l.profile, "/practice")}>Review learner practice <ArrowRight /></Button></li>)}</ul></section>
    <section className="mt-8 border-t pt-6" aria-labelledby="learner-view"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase text-brand">Connected learner view</p><h2 id="learner-view" className="mt-1 text-xl font-bold">{p.name}'s plan for today</h2><p className="mt-2 text-sm text-muted-foreground">{p.exam} · {p.hours}h/day · {p.level} · Exam {p.examDate}</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/plan">Weekly plan</Link></Button><Button asChild variant="hero"><Link to="/practice">Start practice <ArrowRight /></Link></Button></div></div>
      <ul className="mt-4 divide-y">{today.map(t => <li key={t.id} className="flex items-center gap-3 py-3"><Check className="size-4 shrink-0 text-brand" /><div><p className="text-sm font-semibold">{t.topic}</p><p className="text-xs text-muted-foreground">{t.subject} · {t.kind} · {t.minutes} min{t.weak ? " · Weak-topic focus" : ""}</p></div></li>)}</ul>
    </section>
  </AppShell>;
}
