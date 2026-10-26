import { demoProfile, type Profile } from "@/lib/prep-store";
import type { FollowUpStatus } from "@/lib/coach-follow-ups";
import { SAMPLE_EXAM_DATES } from "@/lib/coach-roster";

export type DemoLearner = {
  id: string;
  profile: Profile;
  examDate: string; // stored sample exam date; the card counts down from this
  progress: number | null;
  score: number | null;
  weak: string;
  followUp: string;
  due: string;
  status: FollowUpStatus;
};

/** Three previewed learners: exactly one follow-up overdue, none marked Done. */
export function sampleLearners(active: Profile): DemoLearner[] {
  return [
    {
      id: "active",
      profile: active,
      examDate: SAMPLE_EXAM_DATES.aarav,
      progress: null,
      score: null,
      weak: "Review practice results",
      followUp: "Review weekly plan",
      due: "Today",
      status: "Pending",
    },
    {
      id: "meera",
      profile: { name: "Meera", exam: "NEET", examDate: SAMPLE_EXAM_DATES.meera, hours: 3, level: "beginner" } satisfies Profile,
      examDate: SAMPLE_EXAM_DATES.meera,
      progress: 8,
      score: 55,
      weak: "Genetics",
      followUp: "Discuss Genetics practice gaps",
      due: "Overdue",
      status: "Overdue",
    },
    {
      id: "kabir",
      profile: { name: "Kabir", exam: "CAT", examDate: SAMPLE_EXAM_DATES.kabir, hours: 2, level: "advanced" } satisfies Profile,
      examDate: SAMPLE_EXAM_DATES.kabir,
      progress: 15,
      score: 68,
      weak: "Data Tables",
      followUp: "Check revision priorities",
      due: "Today",
      status: "Pending",
    },
  ];
}

/** Summary derived from the list itself: pending = every item not marked Done. */
export function summarizeDemoFollowUps(learners: DemoLearner[]) {
  const shown = learners.filter((l) => l.status !== "Done");
  return {
    pending: shown.length,
    overdue: shown.filter((l) => l.status === "Overdue").length,
    shown,
  };
}
