import { describe, expect, it } from "vitest";
import { daysUntil, demoProfile } from "@/lib/prep-store";
import { sampleLearners, summarizeDemoFollowUps } from "@/lib/coach-demo";

describe("coach workspace follow-up summary", () => {
  const learners = sampleLearners(demoProfile());

  it("marks exactly one sample follow-up overdue", () => {
    expect(learners.filter((l) => l.status === "Overdue")).toHaveLength(1);
  });

  it("counts every item that is not Done as pending", () => {
    const summary = summarizeDemoFollowUps(learners);
    expect(summary.pending).toBe(learners.filter((l) => l.status !== "Done").length);
    expect(summary.pending).toBe(3);
    expect(summary.overdue).toBe(1);
    expect(summary.shown).toHaveLength(summary.pending);
  });

  it("drops Done items from both the pending count and the shown list", () => {
    const withDone = learners.map((l, i) => (i === 0 ? { ...l, status: "Done" as const } : l));
    const summary = summarizeDemoFollowUps(withDone);
    expect(summary.pending).toBe(2);
    expect(summary.shown).toHaveLength(2);
  });
});

describe("coach workspace exam dates", () => {
  const NOW = new Date(2026, 9, 24); // 24 Oct 2026, local time
  const learners = sampleLearners(demoProfile());

  it("stores each learner's exam date and counts down from it", () => {
    expect(learners.map((l) => [l.profile.name, l.examDate])).toEqual([
      ["Aarav", "2027-01-29"],
      ["Meera", "2027-05-02"],
      ["Kabir", "2026-11-29"],
    ]);
    expect(learners.map((l) => daysUntil(l.examDate, NOW))).toEqual([97, 190, 36]);
  });
});
