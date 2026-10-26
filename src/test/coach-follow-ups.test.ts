import { describe, expect, it } from "vitest";

import { demoProfile } from "@/lib/prep-store";
import { sampleLearners } from "@/lib/coach-demo";
import {
  dueLabel,
  followUpStatus,
  sampleFollowUps,
  summarizeFollowUps,
} from "@/lib/coach-follow-ups";

const NOW = new Date(2026, 9, 24); // 24 Oct 2026, local time

describe("Coach follow-up sample data", () => {
  const followUps = sampleFollowUps(NOW);

  it("lists five sample follow-ups", () => {
    expect(followUps).toHaveLength(5);
  });

  it("includes the three follow-ups previewed on the coach workspace", () => {
    const workspace = sampleLearners(demoProfile());
    expect(workspace).toHaveLength(3);
    for (const learner of workspace) {
      const match = followUps.find(
        (f) => f.learnerName === learner.profile.name && f.topic === learner.followUp,
      );
      expect(match, `${learner.profile.name}'s workspace follow-up is listed`).toBeDefined();
      expect(followUpStatus(match!, NOW)).toBe(
        learner.due === "Overdue" ? "Overdue" : "Pending",
      );
    }
  });

  it("shows one overdue, three pending and one done", () => {
    expect(summarizeFollowUps(followUps, NOW)).toEqual({
      total: 5,
      pending: 3,
      overdue: 1,
      done: 1,
    });
  });

  it("marks a past-dated open task overdue and a done task done", () => {
    const overdue = followUps.find((f) => f.id === "fu-1")!;
    const done = followUps.find((f) => f.id === "fu-5")!;
    expect(followUpStatus(overdue, NOW)).toBe("Overdue");
    expect(followUpStatus(done, NOW)).toBe("Done");
  });

  it("turns a task done as soon as it is ticked off", () => {
    const open = followUps.find((f) => f.id === "fu-2")!;
    expect(followUpStatus(open, NOW)).toBe("Pending");
    expect(followUpStatus({ ...open, done: true }, NOW)).toBe("Done");
  });

  it("words due dates the way the page shows them", () => {
    expect(dueLabel("2026-10-24", NOW)).toBe("Due today");
    expect(dueLabel("2026-10-27", NOW)).toBe("Due in 3 days");
    expect(dueLabel("2026-10-22", NOW)).toBe("2 days overdue");
  });
});
