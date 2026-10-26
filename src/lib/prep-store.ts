import { useSyncExternalStore } from "react";

export type Level = "beginner" | "intermediate" | "advanced";
export interface Profile {
  name: string;
  exam: string;
  examDate: string; // yyyy-mm-dd
  hours: number;
  level: Level;
}
export interface PlanTask {
  id: string;
  day: number; // 0 = today
  subject: string;
  topic: string;
  minutes: number;
  kind: "Learn" | "Practice" | "Revise";
  weak: boolean;
}
export interface PrepState {
  profile: Profile | null;
  done: Record<string, boolean>;
  answered: number;
  correct: number;
  sessionsCompleted: number;
  plan: "free" | "monthly" | "quarterly";
  reminders: boolean;
  email: string;
}

export const EXAM_SUBJECTS: Record<string, { subject: string; topics: string[] }[]> = {
  "JEE Main": [
    { subject: "Physics", topics: ["Kinematics", "Rotational Motion", "Electrostatics", "Optics"] },
    { subject: "Chemistry", topics: ["Chemical Bonding", "Thermodynamics", "Organic Basics", "Equilibrium"] },
    { subject: "Mathematics", topics: ["Calculus", "Coordinate Geometry", "Probability", "Matrices"] },
  ],
  NEET: [
    { subject: "Biology", topics: ["Cell Biology", "Genetics", "Human Physiology", "Ecology"] },
    { subject: "Physics", topics: ["Kinematics", "Current Electricity", "Optics", "Modern Physics"] },
    { subject: "Chemistry", topics: ["Chemical Bonding", "Biomolecules", "Organic Basics", "Equilibrium"] },
  ],
  "CAT": [
    { subject: "Quant", topics: ["Arithmetic", "Algebra", "Geometry", "Number Systems"] },
    { subject: "VARC", topics: ["Reading Comprehension", "Para Jumbles", "Summary Questions", "Vocabulary"] },
    { subject: "DILR", topics: ["Arrangements", "Data Tables", "Games & Tournaments", "Venn Diagrams"] },
  ],
  "UPSC Prelims": [
    { subject: "Polity", topics: ["Fundamental Rights", "Parliament", "Judiciary", "Federalism"] },
    { subject: "History", topics: ["Modern India", "Ancient India", "Art & Culture", "Medieval India"] },
    { subject: "Economy", topics: ["Inflation", "Banking", "Fiscal Policy", "External Sector"] },
  ],
  GATE: [
    { subject: "Core Subject", topics: ["Data Structures", "Algorithms", "Operating Systems", "DBMS"] },
    { subject: "Mathematics", topics: ["Linear Algebra", "Probability", "Discrete Maths", "Calculus"] },
    { subject: "Aptitude", topics: ["Verbal Ability", "Numerical Ability", "Data Interpretation", "Logic"] },
  ],
};
export const COMMON_EXAMS = Object.keys(EXAM_SUBJECTS);
const GENERIC = [
  { subject: "Core Concepts", topics: ["Foundations", "Key Formulas", "Applications", "Problem Solving"] },
  { subject: "Reasoning", topics: ["Logical Reasoning", "Data Interpretation", "Puzzles", "Analytical Ability"] },
  { subject: "General Awareness", topics: ["Current Affairs", "Static GK", "Reading Skills", "Vocabulary"] },
];
export const subjectsFor = (exam: string) => EXAM_SUBJECTS[exam] ?? GENERIC;

export function daysUntil(date: string, now = new Date()) {
  const d = new Date(date + "T00:00:00");
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

/** Deterministic demo plan: weak topics (2nd topic of each subject, plus more for beginners) get extra practice time. */
export function generatePlan(p: Profile): PlanTask[] {
  const subs = subjectsFor(p.exam);
  const total = Math.round(p.hours * 60);
  const days = 7;
  const tasks: PlanTask[] = [];
  const weakIdx = p.level === "beginner" ? [0, 1] : p.level === "intermediate" ? [1] : [3];
  for (let d = 0; d < days; d++) {
    const perDay = 3;
    const share = Math.max(15, Math.round(total / perDay / 5) * 5);
    for (let i = 0; i < perDay; i++) {
      const s = subs[(d + i) % subs.length]!;
      const tIdx = (d + i) % s.topics.length;
      const weak = weakIdx.includes(tIdx);
      const kind: PlanTask["kind"] = i === 0 ? "Learn" : i === 1 ? "Practice" : "Revise";
      tasks.push({
        id: `d${d}-${i}`,
        day: d,
        subject: s.subject,
        topic: s.topics[tIdx]!,
        minutes: weak ? share + 10 : share,
        kind,
        weak,
      });
    }
  }
  return tasks;
}

const KEY = "preppilot-state-v1";
const initial: PrepState = {
  profile: null,
  done: {},
  answered: 0,
  correct: 0,
  sessionsCompleted: 0,
  plan: "free",
  reminders: true,
  email: "aarav.sharma@example.com",
};
let state: PrepState = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}
export function setState(patch: Partial<PrepState> | ((s: PrepState) => Partial<PrepState>)) {
  load();
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
export function resetState() {
  state = initial;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  load();
  listeners.add(l);
  // notify after hydration so stored values appear
  queueMicrotask(l);
  return () => listeners.delete(l);
}
export function usePrep(): PrepState {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => initial,
  );
}

export function demoProfile(): Profile {
  return { name: "Aarav", exam: "JEE Main", examDate: "2027-01-29", hours: 4, level: "intermediate" };
}
export const profileOrDemo = (p: Profile | null) => p ?? demoProfile();
