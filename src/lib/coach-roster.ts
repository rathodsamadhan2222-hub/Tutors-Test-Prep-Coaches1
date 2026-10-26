// Illustrative coach roster: sample learners only, held in component state.
export interface Learner {
  id: string;
  name: string;
  exam: string;
  examDate: string; // yyyy-mm-dd
  progress: number; // 0-100, share of the assigned 7-day plan completed
  weakTopic: string;
  lastActive: string; // yyyy-mm-dd
  followUp: string | null; // pending coach note; null = nothing due
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shift(now: Date, days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Exam dates shared by the roster and the coach workspace preview, so both pages agree. */
export const SAMPLE_EXAM_DATES = {
  aarav: "2027-01-29",
  meera: "2027-05-02",
  kabir: "2026-11-29",
} as const;

/** Six sample learners with exam countdowns and practice gaps. */
export function sampleLearners(now = new Date()): Learner[] {
  return [
    {
      id: "aarav",
      name: "Aarav",
      exam: "JEE Main",
      examDate: SAMPLE_EXAM_DATES.aarav,
      progress: 74,
      weakTopic: "Rotational Motion",
      lastActive: shift(now, 0),
      followUp: null,
    },
    {
      id: "meera",
      name: "Meera",
      exam: "NEET",
      examDate: SAMPLE_EXAM_DATES.meera,
      progress: 38,
      weakTopic: "Genetics",
      lastActive: shift(now, -1),
      followUp: "Discuss Genetics practice gaps",
    },
    {
      id: "kabir",
      name: "Kabir",
      exam: "CAT",
      examDate: SAMPLE_EXAM_DATES.kabir,
      progress: 61,
      weakTopic: "Data Tables",
      lastActive: shift(now, -1),
      followUp: "Check revision priorities",
    },
    {
      id: "ananya",
      name: "Ananya",
      exam: "UPSC Prelims",
      examDate: shift(now, 210),
      progress: 22,
      weakTopic: "Federalism",
      lastActive: shift(now, -3),
      followUp: "First weekly plan not opened yet",
    },
    {
      id: "rohan",
      name: "Rohan",
      exam: "GATE",
      examDate: shift(now, 31),
      progress: 88,
      weakTopic: "DBMS",
      lastActive: shift(now, 0),
      followUp: null,
    },
    {
      id: "sara",
      name: "Sara",
      exam: "NEET",
      examDate: shift(now, 77),
      progress: 47,
      weakTopic: "Human Physiology",
      lastActive: shift(now, -6),
      followUp: "Human Physiology mock review",
    },
  ];
}

export function summarizeRoster(learners: Learner[]) {
  const total = learners.length;
  const needingFollowUp = learners.filter((l) => l.followUp !== null).length;
  const averageProgress =
    total === 0 ? 0 : Math.round(learners.reduce((sum, l) => sum + l.progress, 0) / total);
  return { total, needingFollowUp, averageProgress };
}

export function formatDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
