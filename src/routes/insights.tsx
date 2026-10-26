import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, ArrowRight, Lock, Target, CalendarCheck, BookOpen } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Line, LineChart, CartesianGrid } from "recharts";
import { AppShell, DemoBadge, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { usePrep } from "@/lib/prep-store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/insights")({
  head: () => seo("Performance insights", "Strengths, areas to improve, accuracy by subject and suggested next actions."),
  component: Insights,
});

const SUBJECTS = [
  { name: "Mathematics", acc: 81 },
  { name: "Chemistry", acc: 64 },
  { name: "Physics", acc: 58 },
];
const TREND = [
  { w: "W1", s: 54 }, { w: "W2", s: 59 }, { w: "W3", s: 63 }, { w: "W4", s: 61 }, { w: "W5", s: 68 }, { w: "W6", s: 72 },
];
const STRONG = [["Calculus", 88], ["Coordinate Geometry", 84], ["Thermodynamics", 79]] as const;
const WEAK = [["Electrostatics", 48], ["Chemical Bonding", 55], ["Probability", 61]] as const;

function Insights() {
  const s = usePrep();
  const live = s.answered ? Math.round((s.correct / s.answered) * 100) : null;
  return (
    <AppShell>
      <PageHeader eyebrow="Illustrative learner report" title="Performance insights" description="Sample charts and topic scores, not measured outcomes. Actual practice on this device appears separately below." actions={<DemoBadge />} />

      {live !== null && (
        <p className="mb-6 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-accent-foreground" role="status">
          Your practice on this device: {s.correct}/{s.answered} correct ({live}%).
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-6" aria-labelledby="acc">
          <h2 id="acc" className="text-lg font-bold">Accuracy by subject</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUBJECTS} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={95} tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Accuracy"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="acc" radius={[0, 8, 8, 0]} barSize={26}>
                  {SUBJECTS.map((d) => <Cell key={d.name} fill={d.acc >= 75 ? "var(--chart-1)" : d.acc >= 60 ? "var(--chart-4)" : "var(--destructive)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card-surface p-6" aria-labelledby="trend">
          <h2 id="trend" className="text-lg font-bold">Practice score trend</h2>
          <p className="text-sm text-muted-foreground">Illustrative 6-week chart · not an improvement claim</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="w" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[40, 90]} axisLine={false} tickLine={false} width={30} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Score"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Line dataKey="s" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4, fill: "var(--chart-1)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <TopicList title="Strengths" icon={TrendingUp} items={STRONG} tone="good" />
        <TopicList title="Areas to improve" icon={TrendingDown} items={WEAK} tone="bad" />
      </div>

      <section className="mt-6 card-surface p-6" aria-labelledby="next">
        <h2 id="next" className="text-lg font-bold">Suggested next actions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Action icon={Target} title="Review practice" body="Open the shared 5-question sample set and its explanations." to="/practice" cta="Start practice" />
          <Action icon={BookOpen} title="Revise Chemical Bonding" body="Re-read hybridisation notes, then 5 questions." to="/plan" cta="Open plan" />
          <Action icon={CalendarCheck} title="Review assigned tasks" body="Check the active learner's weekly task completion." to="/plan" cta="Learner plan" />
        </div>
      </section>

      <section className="relative mt-6 overflow-hidden rounded-2xl border bg-card p-6" aria-labelledby="adv">
        <div className="pointer-events-none select-none blur-[3px]" aria-hidden>
          <h2 className="text-lg font-bold">Advanced insights</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">{["Predicted rank", "Time per question", "Silly-mistake rate"].map((x) => <div key={x} className="h-24 rounded-xl bg-muted p-4 text-sm font-semibold">{x}</div>)}</div>
        </div>
        <div className="absolute inset-0 grid place-items-center bg-card/60">
          <div className="text-center">
            <p id="adv" className="flex items-center justify-center gap-2 font-bold"><Lock className="size-4" /> Advanced insights are Pro</p>
            <p className="mt-1 text-sm text-muted-foreground">Rank prediction, time analysis and mistake patterns.</p>
            <Button asChild variant="ink" className="mt-3"><Link to="/premium" search={{ from: "insights" }}>Unlock insights</Link></Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function TopicList({ title, icon: Icon, items, tone }: { title: string; icon: typeof TrendingUp; items: readonly (readonly [string, number])[]; tone: "good" | "bad" }) {
  return (
    <section className="card-surface p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Icon className={tone === "good" ? "size-5 text-success" : "size-5 text-destructive"} /> {title}</h2>
      <ul className="mt-4 space-y-4">
        {items.map(([t, v]) => (
          <li key={t}>
            <div className="flex justify-between text-sm"><span className="font-semibold">{t}</span><span className={tone === "good" ? "font-bold text-success" : "font-bold text-destructive"}>{v}%</span></div>
            <div className="mt-1.5 h-1.5 rounded-full bg-muted"><div className={tone === "good" ? "h-full rounded-full bg-success" : "h-full rounded-full bg-destructive"} style={{ width: `${v}%` }} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Action({ icon: Icon, title, body, to, cta }: { icon: typeof Target; title: string; body: string; to: "/practice" | "/plan" | "/dashboard"; cta: string }) {
  return (
    <div className="rounded-xl border p-4">
      <Icon className="size-5 text-brand" />
      <p className="mt-2 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <Link to={to} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">{cta} <ArrowRight className="size-3.5" /></Link>
    </div>
  );
}
