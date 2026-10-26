import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";
import { COMMON_EXAMS } from "@/lib/prep-store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => seo("Set up your coaching workspace", "Tell PrepPilot your name, subjects, exams, learner count and preferred plan length to set up a demo coach workspace."),
  component: Onboarding,
});

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "Quantitative Aptitude", "Verbal Ability", "Logical Reasoning", "General Studies"];
const PLAN_LENGTHS = [
  { id: "7", label: "1 week", hint: "Short, focused sprints" },
  { id: "14", label: "2 weeks", hint: "Balanced cycles" },
  { id: "30", label: "1 month", hint: "Long-range planning" },
];

type Errors = Partial<Record<"name" | "subjects" | "exams" | "learners", string>>;

function Onboarding() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [learners, setLearners] = useState("");
  const [planLength, setPlanLength] = useState("7");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!subjects.length) e.subjects = "Choose at least one subject you teach.";
    if (!exams.length) e.exams = "Choose at least one exam type.";
    const n = Number(learners);
    if (!learners || !Number.isInteger(n)) e.learners = "Enter how many learners you coach (whole number).";
    else if (n < 0 || n > 500) e.learners = "Enter a number between 0 and 500.";
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => nav({ to: "/dashboard" }), 900);
  }

  const field = "mt-1.5 w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-ring/30";
  const chip = (on: boolean) => cn("inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition", on ? "border-brand bg-brand-soft" : "bg-card hover:border-foreground/30");
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${k}-err`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-16 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Step 1 of 1 · 2 minutes</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Set up your coaching workspace</h1>
        <p className="mt-2 text-muted-foreground">Answer 5 quick questions about you and your coaching, then open your coach workspace.</p>

        <form onSubmit={submit} noValidate className="card-surface mt-8 space-y-6 p-6 sm:p-8">
          <div>
            <label htmlFor="name" className="text-sm font-semibold">Coach name</label>
            <input id="name" className={cn(field, errors.name && "border-destructive")} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
            {err("name")}
          </div>

          <fieldset aria-describedby={errors.subjects ? "subjects-err" : undefined}>
            <legend className="text-sm font-semibold">Subjects you teach</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button key={s} type="button" aria-pressed={subjects.includes(s)} onClick={() => toggle(subjects, setSubjects, s)} className={chip(subjects.includes(s))}>
                  {subjects.includes(s) && <Check className="size-3.5" />}{s}
                </button>
              ))}
            </div>
            {err("subjects")}
          </fieldset>

          <fieldset aria-describedby={errors.exams ? "exams-err" : undefined}>
            <legend className="text-sm font-semibold">Exam types you prepare learners for</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_EXAMS.map((x) => (
                <button key={x} type="button" aria-pressed={exams.includes(x)} onClick={() => toggle(exams, setExams, x)} className={chip(exams.includes(x))}>
                  {exams.includes(x) && <Check className="size-3.5" />}{x}
                </button>
              ))}
            </div>
            {err("exams")}
          </fieldset>

          <div>
            <label htmlFor="learners" className="text-sm font-semibold">Number of learners you currently coach</label>
            <input id="learners" type="number" min={0} max={500} step={1} inputMode="numeric" className={cn(field, errors.learners && "border-destructive")} value={learners} onChange={(e) => setLearners(e.target.value)} placeholder="e.g. 6" aria-invalid={!!errors.learners} aria-describedby={errors.learners ? "learners-err" : undefined} />
            {err("learners")}
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Preferred plan length</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {PLAN_LENGTHS.map((l) => (
                <label key={l.id} className={cn("cursor-pointer rounded-xl border p-3 transition", planLength === l.id ? "border-brand bg-brand-soft ring-2 ring-ring/20" : "bg-card hover:border-foreground/30")}>
                  <input type="radio" name="planLength" value={l.id} checked={planLength === l.id} onChange={() => setPlanLength(l.id)} className="sr-only" />
                  <span className="block text-sm font-bold">{l.label}</span>
                  <span className="block text-xs text-muted-foreground">{l.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {Object.keys(errors).length > 0 && (
            <p className="rounded-xl bg-destructive-soft px-3 py-2 text-sm text-destructive" role="status">
              Please fix the highlighted fields to continue.
            </p>
          )}

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? (<><Loader2 className="animate-spin" /> Setting up workspace…</>) : (<><Sparkles /> Open my coaching workspace <ArrowRight /></>)}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Demo: your answers stay on this page — nothing is saved or sent anywhere.</p>
        </form>
      </main>
    </div>
  );
}
