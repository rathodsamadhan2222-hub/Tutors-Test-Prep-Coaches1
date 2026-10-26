import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Info } from "lucide-react";
import { Logo } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>): { plan: "monthly" | "quarterly" } => ({
    plan: s["plan"] === "quarterly" ? "quarterly" : "monthly",
  }),
  head: () => seo("Subscription confirmed (demo)", "Demo confirmation of your PrepPilot Pro plan. No payment was processed."),
  component: Confirmation,
});

function Confirmation() {
  const { plan } = Route.useSearch();
  const label = plan === "quarterly" ? "Pro Quarterly · ₹6,999 / 3 months" : "Pro Monthly · ₹2,499 / month";
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="card-surface p-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success"><CheckCircle2 className="size-8" /></span>
          <h1 className="mt-5 font-display text-3xl font-semibold">You're on Pro!</h1>
          <p className="mt-2 font-semibold">{label}</p>
          <div className="mt-5 flex gap-3 rounded-xl border border-dashed bg-warn-soft p-4 text-left text-sm" role="note">
            <Info className="mt-0.5 size-4 shrink-0 text-warn" />
            <p><strong>Demo only.</strong> No payment was processed and no card was charged. Pro features are unlocked in this prototype for preview.</p>
          </div>
          <Button asChild variant="hero" size="lg" className="mt-6 w-full"><Link to="/dashboard">Back to dashboard</Link></Button>
          <Link to="/profile" className="mt-3 inline-block text-sm font-semibold text-muted-foreground hover:text-foreground">Manage plan in profile</Link>
        </div>
      </div>
    </div>
  );
}
