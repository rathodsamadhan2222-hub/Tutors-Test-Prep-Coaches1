import type { Learner } from "@/lib/coach-roster";

export interface StudyTask {
  id: string;
  topic: string;
  activity: string;
  duration: number;
}

const TOPICS: Record<string, [string, string, string]> = {
  "JEE Main": ["Electrostatics", "Calculus", "Chemical Bonding"],
  NEET: ["Cell Biology", "Chemical Bonding", "Ecology"],
  CAT: ["Reading Comprehension", "Algebra", "Logical Reasoning"],
  "UPSC Prelims": ["Indian Economy", "Modern History", "Environment"],
  GATE: ["Operating Systems", "Algorithms", "Computer Networks"],
};

export function learnerDetails(learner: Learner, now = new Date()) {
  const topics = TOPICS[learner.exam] ?? ["Core concepts", "Problem solving", "Revision"];
  const strengths = [
    { topic: learner.weakTopic, score: 36 },
    { topic: topics[0], score: 48 },
    { topic: topics[1], score: 82 },
    { topic: topics[2], score: 71 },
  ];
  const tasks: StudyTask[] = [
    { id: "review", topic: learner.weakTopic, activity: "Concept review", duration: 60 },
    { id: "practice", topic: topics[0], activity: "Practice questions", duration: 45 },
    { id: "revision", topic: topics[1], activity: "Revision & recall", duration: 45 },
  ];
  const history = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 13 + index);
    return {
      date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      progress: Math.max(0, learner.progress - (13 - index) * 2),
    };
  });
  return { dailyHours: 2.5, strengths, tasks, history };
}

/** Rotate the same sample tasks; regeneration is not an AI call. */
export function reshuffleTasks(tasks: StudyTask[]): StudyTask[] {
  if (tasks.length < 2) return [...tasks];
  return [...tasks.slice(1), ...tasks.slice(0, 1)];
}

export function assignTopicPractice(tasks: StudyTask[], topic: string): StudyTask[] {
  const id = `assigned-${topic}`;
  if (tasks.some((task) => task.id === id)) return tasks;
  return [...tasks, { id, topic, activity: "Assigned practice", duration: 20 }];
}