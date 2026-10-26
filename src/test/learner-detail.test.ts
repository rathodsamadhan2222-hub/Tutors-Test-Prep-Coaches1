import { describe, expect, it } from "vitest";
import { sampleLearners } from "@/lib/coach-roster";
import { assignTopicPractice, learnerDetails, reshuffleTasks } from "@/lib/learner-detail";

describe("Coach learner detail", () => {
  const learners = sampleLearners(new Date(2026, 9, 24));

  it("provides 14 days of progress ending at each learner's roster percentage", () => {
    for (const learner of learners) {
      const detail = learnerDetails(learner);
      expect(detail.history).toHaveLength(14);
      expect(detail.history.at(-1)?.progress).toBe(learner.progress);
    }
  });

  it("reshuffles the same sample tasks without mutating them", () => {
    const learner = learners[0];
    if (!learner) throw new Error("Missing sample learner");
    const tasks = learnerDetails(learner).tasks;
    const ids = tasks.map((task) => task.id);
    expect(reshuffleTasks(tasks).map((task) => task.id)).not.toEqual(ids);
    expect(reshuffleTasks(tasks).map((task) => task.id).sort()).toEqual([...ids].sort());
    expect(tasks.map((task) => task.id)).toEqual(ids);
  });

  it("assigns a weak-topic practice task once", () => {
    const tasks = assignTopicPractice([], "Electrostatics");
    expect(tasks).toEqual([{ id: "assigned-Electrostatics", topic: "Electrostatics", activity: "Assigned practice", duration: 20 }]);
    expect(assignTopicPractice(tasks, "Electrostatics")).toHaveLength(1);
  });
});