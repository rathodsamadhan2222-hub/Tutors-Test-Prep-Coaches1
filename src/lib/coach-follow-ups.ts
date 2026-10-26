// Illustrative coach follow-ups: sample check-in tasks only, held in component state.
import { daysUntil } from "@/lib/prep-store";
import { toISODate } from "@/lib/coach-roster";

export interface FollowUp {
  id: string;
  learnerId: string;
  learnerName: string;
  exam: string;
  topic: string;
  dueDate: string; // yyyy-mm-dd
  done: boolean;
}

export type FollowUpStatus = "Pending" | "Done" | "Overdue";

function shift(now: Date, days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Done beats everything; otherwise a past due date is overdue. */
export function followUpStatus(f: FollowUp, now = new Date()): FollowUpStatus {
  if (f.done) return "Done";
  return daysUntil(f.dueDate, now) < 0 ? "Overdue" : "Pending";
}

/**
 * Five sample follow-ups: one overdue, three pending, one already done.
 * The first three are the same check-ins previewed on the coach workspace
 * (Aarav, Meera, Kabir), so both coach pages describe the same follow-ups.
 */
export function sampleFollowUps(now = new Date()): FollowUp[] {
  return [
    {
      id: "fu-1",
      learnerId: "meera",
      learnerName: "Meera",
      exam: "NEET",
      topic: "Discuss Genetics practice gaps",
      dueDate: shift(now, -2),
      done: false,
    },
    {
      id: "fu-2",
      learnerId: "kabir",
      learnerName: "Kabir",
      exam: "CAT",
      topic: "Check revision priorities",
      dueDate: shift(now, 0),
      done: false,
    },
    {
      id: "fu-3",
      learnerId: "aarav",
      learnerName: "Aarav",
      exam: "JEE Main",
      topic: "Review weekly plan",
      dueDate: shift(now, 0),
      done: false,
    },
    {
      id: "fu-4",
      learnerId: "ananya",
      learnerName: "Ananya",
      exam: "UPSC Prelims",
      topic: "First weekly plan walkthrough",
      dueDate: shift(now, 3),
      done: false,
    },
    {
      id: "fu-5",
      learnerId: "rohan",
      learnerName: "Rohan",
      exam: "GATE",
      topic: "DBMS mock test review",
      dueDate: shift(now, -4),
      done: true,
    },
  ];
}

export function summarizeFollowUps(followUps: FollowUp[], now = new Date()) {
  const statuses = followUps.map((f) => followUpStatus(f, now));
  return {
    total: followUps.length,
    pending: statuses.filter((s) => s === "Pending").length,
    overdue: statuses.filter((s) => s === "Overdue").length,
    done: statuses.filter((s) => s === "Done").length,
  };
}

/** Human wording of a due date, e.g. "Due in 3 days" or "2 days overdue". */
export function dueLabel(iso: string, now = new Date()): string {
  const days = daysUntil(iso, now);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days} days`;
  if (days === -1) return "1 day overdue";
  return `${Math.abs(days)} days overdue`;
}
