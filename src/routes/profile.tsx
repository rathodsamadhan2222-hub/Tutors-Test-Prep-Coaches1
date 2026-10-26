import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { profileOrDemo, resetState, setState, usePrep } from "@/lib/prep-store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/profile")({
  head: () => seo("Profile & settings", "Manage your PrepPilot profile, study preferences and plan."),
  component: ProfilePage,
});

function ProfilePage() {
  const s = usePrep();
  const p = profileOrDemo(s.profile);
  const nav = useNavigate();
  const [name, setName] = useState(p.name);
  const [email, setEmail] = useState(s.email);
  const [hours, setHours] = useState(String(p.hours));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setName(p.name); setEmail(s.email); setHours(String(p.hours)); }, [s.profile, s.email]); // eslint-disable-line react-hooks/exhaustive-deps

  function save(e: FormEvent) {
    e.preventDefault();
    const h = Number(hours);
    if (!name.trim()) return setErr("Name can't be empty.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (!(h >= 0.5 && h <= 14)) return setErr("Daily hours must be between 0.5 and 14.");
    setErr(null);
    setState({ profile: { ...p, name: name.trim(), hours: h }, email });
    toast.success("Profile saved on this device");
  }
  const field = "mt-1.5 w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-ring/30";

  return (
    <AppShell>
      <PageHeader eyebrow="Account" title="Profile & settings" description="Sample profile stored only in this browser." />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={save} noValidate className="card-surface space-y-5 p-6">
          <h2 className="text-lg font-bold">Profile</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="pname" className="text-sm font-semibold">Name</label><input id="pname" className={field} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label htmlFor="pemail" className="text-sm font-semibold">Email</label><input id="pemail" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><p className="text-sm font-semibold">Exam</p><p className="mt-1.5 rounded-xl bg-muted px-3.5 py-2.5 text-sm">{p.exam} · {new Date(p.examDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
            <div><label htmlFor="phours" className="text-sm font-semibold">Daily study hours</label><input id="phours" type="number" step={0.5} min={0.5} max={14} className={field} value={hours} onChange={(e) => setHours(e.target.value)} /></div>
          </div>
          {err && <p role="alert" className="rounded-xl bg-destructive-soft px-3 py-2 text-sm text-destructive">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="ink">Save changes</Button>
            <Button asChild variant="outline"><Link to="/onboarding">Change exam</Link></Button>
          </div>
        </form>

        <div className="space-y-6">
          <section className="card-surface p-6">
            <h2 className="text-lg font-bold">Preferences</h2>
            <div className="mt-4 flex items-center justify-between gap-4">
              <label htmlFor="rem" className="text-sm"><span className="block font-semibold">Daily reminder</span><span className="text-muted-foreground">Nudge at 7:00 PM (demo)</span></label>
              <Switch id="rem" checked={s.reminders} onCheckedChange={(v) => setState({ reminders: v })} />
            </div>
          </section>
          <section className="card-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Crown className="size-5 text-brand" /> Plan</h2>
            <p className="mt-2 text-sm">Current: <strong>{s.plan === "free" ? "Starter" : s.plan === "monthly" ? "Pro Monthly (demo)" : "Pro Quarterly (demo)"}</strong></p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="sm"><Link to="/premium">{s.plan === "free" ? "Upgrade" : "Change plan"}</Link></Button>
              {s.plan !== "free" && <Button size="sm" variant="outline" onClick={() => { setState({ plan: "free" }); toast("Switched back to Starter"); }}>Cancel Pro</Button>}
            </div>
          </section>
          <section className="rounded-2xl border border-dashed p-6">
            <h2 className="font-bold">Reset demo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Clears your plan, progress and settings from this browser.</p>
            <Button size="sm" variant="destructive" className="mt-3" onClick={() => { resetState(); toast("Demo data cleared"); nav({ to: "/" }); }}>Reset everything</Button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
