import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, RefreshCw, Target } from "lucide-react";
import { AppShell, DemoBadge, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatDay, sampleLearners, type Learner } from "@/lib/coach-roster";
import { assignTopicPractice, learnerDetails, reshuffleTasks } from "@/lib/learner-detail";
import { seo } from "@/lib/seo";

declare module "@tanstack/history" {
  interface HistoryState {
    coachLearner?: Learner;
  }
}

export const Route = createFileRoute("/coach_/learner/$id")({
  head: ({ params }) => seo(
    `${sampleLearners().find((learner) => learner.id === params.id)?.name ?? "Learner"} · Coach details`,
    "Review a sample learner's study plan, topic strengths, weak-topic practice assignments and 14-day progress in PrepPilot AI.",
  ),
  component: LearnerDetailPage,
});

function LearnerDetailPage() {
  const { id } = Route.useParams();
  const passedLearner = useRouterState({ select: (state) => state.location.state.coachLearner });
  const [samples] = useState(() => sampleLearners());
  const learner = passedLearner?.id === id ? passedLearner : samples.find((item) => item.id === id);
  if (!learner) {
    return <AppShell><PageHeader title="Learner not found" description="This learner is not in the sample roster." /><Button asChild variant="outline"><Link to="/coach"><ArrowLeft /> Back to coach roster</Link></Button></AppShell>;
  }
  return <LearnerDetail key={id} learner={learner} />;
}

function LearnerDetail({ learner }: { learner: Learner }) {
  const [detail] = useState(() => learnerDetails(learner));
  const [tasks, setTasks] = useState(detail.tasks);
  const [notice, setNotice] = useState("");
  const weakTopics = detail.strengths.filter((item) => item.score < 60);

  return (
    <AppShell>
      <Link to="/coach" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to coach roster</Link>
      <PageHeader eyebrow="Coach view · learner details" title={learner.name} description={learner.exam} />
      <div className="mb-7 flex flex-wrap items-center gap-3"><DemoBadge /><p className="text-xs text-muted-foreground">Sample learner plan, strengths and progress · assignments stay in this demo view.</p></div>

      <dl className="grid gap-4 border-y py-5 sm:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">Preparing for</dt><dd className="mt-2 font-semibold">{learner.exam}</dd></div>
        <div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4" /> Exam date</dt><dd className="mt-2 font-semibold">{formatDay(learner.examDate)}</dd></div>
        <div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-4" /> Daily study hours</dt><dd className="mt-2 font-semibold">{detail.dailyHours} hours / day</dd></div>
      </dl>

      <section className="mt-8" aria-labelledby="today-plan">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 id="today-plan" className="text-xl font-bold">Today's study plan</h2><p className="mt-1 text-sm text-muted-foreground">{tasks.length} tasks · {tasks.reduce((sum, task) => sum + task.duration, 0)} minutes</p></div>
          <Button variant="outline" onClick={() => { setTasks(reshuffleTasks(tasks)); setNotice("Sample plan reshuffled."); }}><RefreshCw /> Regenerate plan</Button>
        </div>
        <p role="status" className="mt-3 min-h-5 text-sm font-medium text-brand">{notice}</p>
        <ul className="mt-2 divide-y border-y" aria-label="Today's study tasks">
          {tasks.map((task, index) => <li key={task.id} className="flex items-center gap-3 py-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-sm font-bold text-accent-foreground">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-semibold">{task.topic}</p><p className="mt-1 text-xs text-muted-foreground">{task.activity}</p></div><span className="shrink-0 text-sm font-semibold">{task.duration} min</span></li>)}
        </ul>
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="strengths"><h2 id="strengths" className="text-xl font-bold">Topic-wise strengths</h2><div className="mt-5 space-y-5">{detail.strengths.map((item) => <div key={item.topic}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{item.topic}</span><span className="font-semibold">{item.score}%</span></div><progress value={item.score} max={100} aria-label={`${item.topic} strength`} className="h-2 w-full accent-brand" /></div>)}</div></section>
        <section aria-labelledby="weak-topics"><h2 id="weak-topics" className="text-xl font-bold">Weak topics</h2><ul className="mt-4 divide-y">{weakTopics.map((item) => {
          const assigned = tasks.some((task) => task.id === `assigned-${item.topic}`);
          return <li key={item.topic} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{item.topic}</p><p className="mt-1 text-xs text-muted-foreground">{item.score}% · needs practice</p></div><Button size="sm" variant={assigned ? "outline" : "ink"} disabled={assigned} aria-label={`${assigned ? "Practice assigned for" : "Assign practice for"} ${item.topic}`} onClick={() => { setTasks(assignTopicPractice(tasks, item.topic)); setNotice(`Sample practice assigned for ${item.topic}.`); }}><Target /> {assigned ? "Practice assigned" : "Assign practice"}</Button></li>;
        })}</ul></section>
      </div>

      <section className="mt-10 border-t pt-7" aria-labelledby="progress-history">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="progress-history" className="text-xl font-bold">Progress over 14 days</h2><p className="mt-1 text-sm text-muted-foreground">Sample assigned-plan completion</p></div><p className="text-2xl font-bold text-brand">{learner.progress}% <span className="text-xs font-medium text-muted-foreground">current</span></p></div>
        <div className="mt-5 flex gap-2">
          <div className="flex h-44 shrink-0 flex-col justify-between text-[10px] text-muted-foreground"><span>100%</span><span>50%</span><span>0%</span></div>
          <div className="grid min-w-0 flex-1 grid-cols-14 items-end gap-1 border-b" role="img" aria-label={`14-day sample progress from ${detail.history[0]?.progress}% to ${learner.progress}%`}>
            {detail.history.map((day) => <div key={day.date} className="flex h-44 flex-col-reverse" title={`${day.date}: ${day.progress}%`}><progress className="sr-only" aria-label={`${day.date} plan completion`} value={day.progress} max={100} /><div className="min-h-0.5 rounded-t-sm bg-brand" style={{ height: `${day.progress}%` }} /></div>)}
          </div>
        </div>
        <div className="ml-10 mt-2 flex justify-between gap-2 text-[10px] text-muted-foreground"><span>{detail.history[0]?.date}</span><span>{detail.history[6]?.date}</span><span>{detail.history[13]?.date}</span></div>
      </section>
    </AppShell>
  );
}