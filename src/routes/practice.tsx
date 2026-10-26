import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Lock, Lightbulb } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { QUESTIONS } from "@/lib/questions";
import { setState, usePrep } from "@/lib/prep-store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  head: () => seo("Practice", "Exam-style multiple-choice practice with instant feedback and explanations."),
  component: Practice,
});

function Practice() {
  const s = usePrep();
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const q = QUESTIONS[i];
  if (!q) return null;
  const correct = sel === q.answer;

  function check() {
    if (sel === null || !q) return;
    const isCorrect = sel === q.answer;
    setChecked(true);
    setResults((r) => [...r, isCorrect]);
    setState((st) => ({ answered: st.answered + 1, correct: st.correct + (isCorrect ? 1 : 0) }));
  }
  function next() {
    if (i === QUESTIONS.length - 1) {
      setFinished(true);
      setState((st) => ({ sessionsCompleted: st.sessionsCompleted + 1 }));
      return;
    }
    setI(i + 1); setSel(null); setChecked(false);
  }
  function restart() { setI(0); setSel(null); setChecked(false); setResults([]); setFinished(false); }

  if (finished) {
    const score = results.filter(Boolean).length;
    const missed = QUESTIONS.filter((_, k) => !results[k]);
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <div className="card-surface p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand"><Trophy className="size-7" /></span>
            <h1 className="mt-4 font-display text-3xl font-semibold">Session complete</h1>
            <p className="mt-2 text-muted-foreground">You scored <strong className="text-foreground">{score}/{QUESTIONS.length}</strong> ({Math.round((score / QUESTIONS.length) * 100)}%).</p>
            {missed.length > 0 ? (
              <p className="mt-4 text-sm">Review next: {missed.map((m) => m.topic).join(", ")}</p>
            ) : <p className="mt-4 text-sm font-semibold text-success">Perfect score — great work!</p>}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={restart}><RotateCcw /> Practice again</Button>
              <Button asChild variant="ink"><Link to="/insights">See insights</Link></Button>
            </div>
          </div>
          {s.plan === "free" && (
            <div className="mt-6 rounded-2xl bg-ink p-6 text-primary-foreground">
              <p className="flex items-center gap-2 text-sm font-bold text-accent-brand"><Lock className="size-4" /> Starter session complete · demo replay available</p>
              <p className="mt-2 text-lg font-semibold">Want unlimited practice and full mock tests?</p>
              <p className="mt-1 text-sm opacity-80">Pro unlocks unlimited sets, topic-wise mock tests and detailed weak-area reports.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="hero"><Link to="/premium" search={{ from: "practice" }}>See Pro plans</Link></Button>
                <Button asChild className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"><Link to="/dashboard">Maybe later</Link></Button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Learner practice · sample set" title="Practice session" description="5 illustrative questions shared across learner demos; not generated from the selected exam or assigned plan." />
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-semibold">Question {i + 1} of {QUESTIONS.length}</span>
          <span className="text-muted-foreground">{results.filter(Boolean).length} correct so far</span>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {QUESTIONS.map((_, k) => (
            <div key={k} className={cn("h-1.5 flex-1 rounded-full", k < results.length ? (results[k] ? "bg-brand" : "bg-destructive") : k === i ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        <div className="card-surface mt-6 p-6 sm:p-8">
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{q.subject} · {q.topic}</span>
          <h2 id="qtext" className="mt-4 text-lg font-semibold leading-snug sm:text-xl">{q.q}</h2>
          <div role="radiogroup" aria-labelledby="qtext" className="mt-6 space-y-3">
            {q.options.map((o, k) => {
              const isSel = sel === k;
              const state = checked ? (k === q.answer ? "right" : isSel ? "wrong" : "idle") : isSel ? "sel" : "idle";
              return (
                <button key={k} role="radio" aria-checked={isSel} disabled={checked} onClick={() => setSel(k)}
                  className={cn("flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition disabled:cursor-default",
                    state === "idle" && "border-border bg-card hover:border-foreground/30",
                    state === "sel" && "border-primary bg-secondary",
                    state === "right" && "border-success bg-success-soft",
                    state === "wrong" && "border-destructive bg-destructive-soft")}>
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-bold",
                    state === "sel" && "border-primary bg-primary text-primary-foreground")}>{String.fromCharCode(65 + k)}</span>
                  <span className="flex-1">{o}</span>
                  {state === "right" && <CheckCircle2 className="size-5 text-success" aria-label="Correct answer" />}
                  {state === "wrong" && <XCircle className="size-5 text-destructive" aria-label="Your answer, incorrect" />}
                </button>
              );
            })}
          </div>

          {checked && (
            <div role="status" className={cn("mt-6 rounded-xl p-4", correct ? "bg-success-soft" : "bg-destructive-soft")}>
              <p className={cn("flex items-center gap-2 font-bold", correct ? "text-success" : "text-destructive")}>
                {correct ? <><CheckCircle2 className="size-5" /> Correct!</> : <><XCircle className="size-5" /> Not quite — the answer is {String.fromCharCode(65 + q.answer)}.</>}
              </p>
              <p className="mt-2 flex gap-2 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-warn" /> {q.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{!checked && sel === null ? "Select an option to continue" : ""}</p>
            {!checked ? (
              <Button variant="ink" size="lg" onClick={check} disabled={sel === null}>Check answer</Button>
            ) : (
              <Button variant="hero" size="lg" onClick={next}>{i === QUESTIONS.length - 1 ? "Finish session" : "Next question"} <ArrowRight /></Button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
