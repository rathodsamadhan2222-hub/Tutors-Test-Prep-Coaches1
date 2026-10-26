import { describe, expect, it } from "vitest";

import { daysUntil } from "@/lib/prep-store";
import { sampleLearners, summarizeRoster } from "@/lib/coach-roster";

const NOW = new Date(2026, 9, 24); // 24 Oct 2026, local time

describe("Coach roster sample data", () => {
  const learners = sampleLearners(NOW);

  it("lists six sample learners", () => {
    expect(learners).toHaveLength(6);
  });

  it("stores the shared exam dates for Aarav, Meera and Kabir", () => {
    expect(Object.fromEntries(learners.map((l) => [l.id, l.examDate]))).toMatchObject({
      aarav: "2027-01-29",
      meera: "2027-05-02",
      kabir: "2026-11-29",
    });
  });

  it("flags exactly three learners for follow-up", () => {
    expect(learners.filter((l) => l.followUp !== null)).toHaveLength(4);
  });

  it("reports the summary numbers the dashboard shows", () => {
    expect(summarizeRoster(learners)).toEqual({
      total: 6,
      needingFollowUp: 4,
      averageProgress: 55,
    });
  });

  it("keeps every exam in the future and every last-active date in the past", () => {
    for (const l of learners) {
      expect(daysUntil(l.examDate, NOW)).toBeGreaterThan(0);
      expect(daysUntil(l.lastActive, NOW)).toBeLessThanOrEqual(0);
    }
  });
});
