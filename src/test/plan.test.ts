import { describe, expect, it } from "vitest";
import { generatePlan, subjectsFor } from "@/lib/prep-store";

describe("generatePlan", () => {
  const p = { name: "A", exam: "NEET", examDate: "2030-01-01", hours: 3, level: "intermediate" as const };
  it("builds 7 days of 3 tasks", () => {
    expect(generatePlan(p)).toHaveLength(21);
    for (let day = 0; day < 7; day++) {
      expect(generatePlan(p).filter((task) => task.day === day)).toHaveLength(3);
    }
  });
  it("gives weak topics 10 extra minutes", () => {
    const t = generatePlan(p);
    const weak = t.find((x) => x.weak);
    const normal = t.find((x) => !x.weak);
    expect(weak).toBeDefined();
    expect(normal).toBeDefined();
    expect((weak?.minutes ?? 0) - (normal?.minutes ?? 0)).toBe(10);
  });
  it.each([
    ["beginner", [0, 1]],
    ["intermediate", [1]],
    ["advanced", [3]],
  ] as const)("marks the specified weak topics for %s learners", (level, indexes) => {
    for (const task of generatePlan({ ...p, level })) {
      const subject = subjectsFor(p.exam).find((s) => s.subject === task.subject);
      expect(subject).toBeDefined();
      const topicIndex = subject?.topics.indexOf(task.topic) ?? -1;
      expect(topicIndex).toBeGreaterThanOrEqual(0);
      expect(task.weak).toBe(indexes.some((index) => index === topicIndex));
      expect(task.minutes).toBe(task.weak ? 70 : 60);
    }
  });
});
