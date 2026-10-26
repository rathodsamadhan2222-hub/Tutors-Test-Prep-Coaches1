import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  BookOpen,
  ClipboardCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";
import { seo } from "@/lib/seo";
import { generatePlan, profileOrDemo, usePrep } from "@/lib/prep-store";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Weekly planning for test-prep coaches",
      "PrepPilot AI is a workspace for independent tutors and test-prep coaches to assign learner preparation plans, review practice gaps and organize follow-ups.",
    ),
  component: Landing,
});

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Personalized study plans",
    body: "Turn each learner's exam date, daily study hours and current level into a clear 7-day plan you can assign in minutes.",
  },
  {
    icon: BarChart3,
    title: "Learner progress tracking",
    body: "See how far every learner has come through their assigned plan and practice, so nothing slips between sessions.",
  },
  {
    icon: Target,
    title: "Weak-topic detection",
    body: "Spot the topics each learner keeps getting wrong and give those areas extra time in the next plan.",
  },
  {
    icon: CalendarClock,
    title: "Follow-up management",
    body: "Keep a running list of who to check in with next and what to raise, so no learner goes unmentioned.",
  },
];

const DEMO_STEPS = [
  { to: "/dashboard", label: "Coach workspace", icon: Users },
  { to: "/plan", label: "Learner study plan", icon: CalendarCheck },
  { to: "/practice", label: "Practice questions", icon: ClipboardCheck },
  { to: "/insights", label: "Performance insights", icon: TrendingUp },
  { to: "/premium", label: "Premium plans", icon: Crown },
] as const;

function Landing() {
  const state = usePrep();
  const learner = profileOrDemo(state.profile);
  const tasks = generatePlan(learner);
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-hero">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo />
          <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
            <Link to="/premium" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
              Pricing
            </Link>
            <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Coach demo
            </Link>
            <Button asChild variant="ink" size="sm">
              <Link to="/onboarding">Get started</Link>
            </Button>
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-semibold text-accent-foreground">
              <span className="size-1.5 rounded-full bg-brand" /> Tutors / Test-Prep Coaches
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Run your coaching practice <br />
              <span className="text-brand">from one workspace.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Build personalized study plans, track learner progress and manage follow-ups for every learner in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link to="/onboarding">
                  Start coaching workspace <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-card/70">
                <Link to="/dashboard">See coach demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">JEE · NEET · CAT · UPSC · GATE | Illustrative demo</p>
            <nav aria-label="Demo journey" className="mt-6 border-t pt-4">
              <p className="mb-3 text-xs font-bold uppercase text-brand">Demo journey</p>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
                {DEMO_STEPS.map((step, index) => (
                  <li key={step.to} className="flex items-center gap-2">
                    {index > 0 && <ArrowRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />}
                    <Link to={step.to} className="font-semibold underline decoration-brand/40 underline-offset-4 hover:text-brand">
                      {index === 1 ? "Learner plan" : index === 2 ? "Practice" : index === 3 ? "Insights" : index === 4 ? "Premium" : step.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <DashboardPreview />
        </section>
      </div>

      <section className="border-b" aria-labelledby="interactive-demo">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 id="interactive-demo" className="font-display text-3xl font-semibold">Explore the interactive demo</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">Start anywhere—no setup required. The study plan and practice questions are the connected learner flow within the coach workspace. All data and subscriptions are illustrative.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {DEMO_STEPS.map((step) => (
              <Button key={step.to} asChild variant="outline" className="h-auto min-h-14 justify-start whitespace-normal px-4 py-3 text-left">
                <Link to={step.to}><step.icon className="size-5 shrink-0 text-brand" />{step.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-labelledby="benefits">
        <h2 id="benefits" className="max-w-xl font-display text-3xl font-semibold sm:text-4xl">
          Built for coaches managing more than one learner.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card-surface p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
                <b.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-brand-soft" aria-labelledby="why-preppilot">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 id="why-preppilot" className="font-display text-4xl font-semibold">Why PrepPilot</h2>
          <p className="mt-4 max-w-3xl text-lg font-semibold">Weak topics get extra study time in every learner's plan, so you spend session time teaching instead of rebuilding plans by hand.</p>
          <p className="mt-3 max-w-3xl text-muted-foreground">Manage every learner's plan, progress and follow-ups from one dashboard.</p>
          <div className="mt-6 border-t pt-5">
            <p className="flex items-center gap-2 font-bold"><BookOpen className="size-5 shrink-0 text-brand" />Demo proof: 7-day plan · 3 tasks per day · {tasks.length} total</p>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-muted-foreground">Sample learner / exam</dt><dd className="mt-1 font-bold">{learner.name} · {learner.exam}</dd></div>
              <div><dt className="text-muted-foreground">Learner exam date</dt><dd className="mt-1 font-bold">{learner.examDate}</dd></div>
              <div><dt className="text-muted-foreground">Available daily hours</dt><dd className="mt-1 font-bold">{learner.hours} hours/day</dd></div>
              <div><dt className="text-muted-foreground">Learner level</dt><dd className="mt-1 font-bold capitalize">{learner.level}</dd></div>
            </dl>
            <p className="mt-5 max-w-3xl text-sm text-muted-foreground">Demo rule: topics marked weak get 10 extra minutes per task.</p>
            <div className="mt-4 flex flex-wrap gap-3"><Button asChild variant="ink"><Link to="/onboarding">Start coaching workspace <ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/plan">Inspect the 7-day learner plan</Link></Button></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">Give your learners a clear next step.</h2>
            <p className="mt-2 opacity-80">Start with a learner plan. Explore simulated coach plans from ₹999/month.</p>
          </div>
          <Button asChild variant="hero" size="lg">
            <Link to="/onboarding">
              Build learner plan <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        PrepPilot AI · UI prototype with sample data. No real AI, accounts or payments.
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="border-y py-6" aria-label="Sample coach workspace">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase text-brand">Coach workspace</p><h2 className="mt-1 font-display text-2xl font-semibold">Learners to check in with</h2></div><Users className="size-6 shrink-0 text-brand" /></div>
      <p className="mt-2 text-xs text-muted-foreground">Illustrative roster · 3 weekly plans assigned</p>
      <ul className="mt-5 divide-y">{[
        ["Aarav", "JEE Main", "Review weekly plan", "Today"],
        ["Meera", "NEET", "Genetics needs attention", "Today"],
        ["Kabir", "CAT", "Check revision priorities", "Tomorrow"],
      ].map(([name, exam, focus, due]) => <li key={name} className="flex items-start gap-3 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-accent-foreground">{name?.charAt(0)}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{name} <span className="font-normal text-muted-foreground">· {exam}</span></p><p className="mt-1 text-xs text-muted-foreground">{focus}</p></div><span className="text-xs font-semibold text-warn">{due}</span></li>)}</ul>
      <Button asChild variant="outline" className="mt-4 w-full"><Link to="/dashboard">Open coach workspace <ArrowRight /></Link></Button>
    </div>
  );
}
