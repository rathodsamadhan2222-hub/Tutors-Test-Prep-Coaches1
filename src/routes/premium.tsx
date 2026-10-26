import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, X, Crown, Loader2 } from "lucide-react";
import { Logo } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { setState, usePrep } from "@/lib/prep-store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { STARTER_PRICE, STARTER_LEARNER_LIMIT, MONTHLY_PRICE, QUARTERLY_PRICE, QUARTERLY_SAVING, inr } from "@/lib/premium-plans";

type From = "practice" | "insights" | "mock" | undefined;
export const Route = createFileRoute("/premium")({
  validateSearch: (s: Record<string, unknown>): { from?: From } => ({
    from: ["practice", "insights", "mock"].includes(s["from"] as string) ? (s["from"] as From) : undefined,
  }),
  head: () => seo("Premium plans", "Coach plans: Starter for up to 5 learners at ₹999/month, or Pro with unlimited learners from ₹2,499/month."),
  component: Premium,
});

const TRIGGER: Record<string, string> = {
  practice: "You've finished today's free practice session.",
  insights: "Advanced insights are part of Premium.",
  mock: "Full-length mock tests are part of Premium.",
};

export const PLANS = [
  { id: "free", name: "Starter", price: inr(STARTER_PRICE), per: "/month", billing: `Billed ${inr(STARTER_PRICE)} every month. Cancel anytime.`, features: [`Up to ${STARTER_LEARNER_LIMIT} learners`, "Personalized study plans", "1 practice session per learner per day", "Weak-topic highlights"] },
  { id: "monthly", name: "Pro Monthly", price: inr(MONTHLY_PRICE), per: "/month", billing: `Billed ${inr(MONTHLY_PRICE)} every month. Cancel anytime.`, features: ["Unlimited learners", "Everything in Starter", "Unlimited practice sessions", "Full-length mock tests", "Advanced insights"] },
  { id: "quarterly", name: "Pro Quarterly", price: inr(QUARTERLY_PRICE), per: "/3 months", billing: `Billed ${inr(QUARTERLY_PRICE)} every 3 months.`, badge: `Save ${inr(QUARTERLY_SAVING)} vs monthly`, features: ["Everything in Pro Monthly", "Best value for exam season", "Priority new question packs"] },
] as const;

const COMPARE: [string, string | boolean, string | boolean][] = [
  ["Learners", `Up to ${STARTER_LEARNER_LIMIT}`, "Unlimited"],
  ["Personalized study plan", true, true],
  ["Practice sessions", "1 / day", "Unlimited"],
  ["Answer explanations", true, true],
  ["Full-length mock tests", false, true],
  ["Advanced insights (rank, timing)", false, true],
  ["Study assistant chats", "3 / day", "Unlimited"],
];

function Premium() {
  const { from } = Route.useSearch();
  const s = usePrep();
  const nav = useNavigate();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  function close() {
    if (window.history.length > 1) router.history.back();
    else nav({ to: "/dashboard" });
  }
  function choose(id: "monthly" | "quarterly") {
    setBusy(id);
    setTimeout(() => {
      setState({ plan: id });
      nav({ to: "/confirmation", search: { plan: id } });
    }, 800);
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Button variant="outline" onClick={close} aria-label="Close pricing">
          <X className="size-4" /> <span className="hidden sm:inline">Not now</span>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          {from && <p className="mb-3 inline-block rounded-full bg-warn-soft px-3 py-1 text-xs font-bold text-warn">{TRIGGER[from]}</p>}
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Plans for coaches</h1>
          <p className="mt-3 text-muted-foreground">Start with up to 5 learners on Starter, or go Pro for unlimited learners, mock tests and deeper insights.</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => {
            const current = s.plan === p.id;
            const featured = p.id === "quarterly";
            return (
               <div key={p.id} aria-label={p.name} className={cn("relative flex flex-col rounded-3xl border p-6 sm:p-7", featured ? "bg-ink text-primary-foreground shadow-card" : "bg-card shadow-soft")}>
                 {"badge" in p && <span className="mb-3 w-fit rounded-full bg-accent-brand px-3 py-1 text-xs font-bold text-accent-brand-foreground">{p.badge}</span>}
                <p className="flex items-center gap-2 font-bold">{p.id !== "free" && <Crown className="size-4 text-accent-brand" />}{p.name}</p>
                <p className="mt-4"><span className="font-display text-4xl font-semibold">{p.price}</span> <span className="text-sm opacity-70">{p.per}</span></p>
                <p className={cn("mt-2 text-xs", featured ? "opacity-75" : "text-muted-foreground")}>{p.billing}</p>
                                 <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check className={cn("mt-0.5 size-4 shrink-0", featured ? "text-accent-brand" : "text-brand")} /> {f}</li>)}
                </ul>
                <div className="mt-6">
                  {p.id === "free" ? (
                    <Button variant="outline" className="w-full" onClick={() => { if (s.plan !== "free") setState({ plan: "free" }); nav({ to: "/dashboard" }); }}>
                      {current ? "Continue on Starter" : "Switch to Starter"}
                    </Button>
                  ) : current ? (
                    <Button disabled className="w-full">Current plan</Button>
                  ) : (
                    <Button variant={featured ? "hero" : "ink"} className="w-full" disabled={!!busy} onClick={() => choose(p.id)}>
                      {busy === p.id ? <><Loader2 className="animate-spin" /> Processing demo…</> : `Choose ${p.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Prototype only: choosing a plan shows a demo confirmation. No payment details are collected and nothing is charged.</p>

        <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="cmp">
          <h2 id="cmp" className="text-center text-2xl font-bold">Starter vs Pro</h2>
          <div className="card-surface mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead><tr className="border-b text-left"><th className="p-4 font-semibold">Feature</th><th className="p-4 text-center font-semibold">Starter</th><th className="p-4 text-center font-semibold">Pro</th></tr></thead>
              <tbody>
                {COMPARE.map(([f, a, b]) => (
                  <tr key={f} className="border-b last:border-0">
                    <td className="p-4">{f}</td>
                    {[a, b].map((v, k) => (
                      <td key={k} className="p-4 text-center">
                         {typeof v === "boolean" ? <span className="inline-flex items-center justify-center gap-1.5">{v ? <Check className="size-4 shrink-0 text-brand" aria-hidden="true" /> : <Minus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}<span>{v ? "Included" : "Not included"}</span></span> : <span className="font-semibold">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5"><p className="font-bold">When will I be charged?</p><p className="mt-1 text-muted-foreground">In the real product, you'd pay at checkout and renew automatically each period. Cancel anytime before renewal.</p></div>
             <div className="rounded-2xl border bg-card p-5"><p className="font-bold">What do these limits apply to?</p><p className="mt-1 text-muted-foreground">The connected learner demo. Coach roster and follow-ups are illustrative; no per-learner billing is simulated.</p></div>
          </div>
          <div className="mt-8 text-center"><Link to="/dashboard" className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground">Continue on Starter</Link></div>
        </section>
      </main>
    </div>
  );
}
