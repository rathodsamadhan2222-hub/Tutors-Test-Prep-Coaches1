import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Target,
  BarChart3,
  Crown,
  UserRound,
  Users,
  CalendarClock,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { usePrep, profileOrDemo } from "@/lib/prep-store";
import { cn } from "@/lib/utils";
import { STARTER_LEARNER_LIMIT } from "@/lib/premium-plans";

const NAV = [
  { to: "/dashboard", label: "Coach workspace", icon: LayoutDashboard },
  { to: "/coach", label: "Coach roster", icon: Users },
  { to: "/coach/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { to: "/plan", label: "Learner study plan", icon: CalendarCheck },
  { to: "/practice", label: "Learner practice", icon: Target },
  { to: "/insights", label: "Learner insights", icon: BarChart3 },
  { to: "/premium", label: "Premium", icon: Crown },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-bold text-foreground", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-accent-brand shadow-soft">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="text-lg tracking-tight">
        PrepPilot <span className="text-brand">AI</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        // Every nav target is its own page, so only the current path is active.
        const active = path === to;
        return (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {label === "Premium" && !active && (
              <span className="ml-auto rounded-full bg-accent-brand px-2 py-0.5 text-[10px] font-bold text-accent-brand-foreground">
                PRO
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const s = usePrep();
  const p = profileOrDemo(s.profile);
  const path = useRouterState({ select: (st) => st.location.pathname });
  // Coach routes get the learner-limit prompt; learner routes keep the mock-test prompt.
  const coachView = path === "/dashboard" || path.startsWith("/coach");
  return (
    <div className="space-y-3">
      {s.plan === "free" ? (
        <div className="rounded-2xl bg-ink p-4 text-primary-foreground">
          <p className="text-sm font-semibold">{coachView ? "Add more learners with Pro" : "Unlock mock tests"}</p>
          <p className="mt-1 text-xs opacity-75">
            {coachView
              ? `Starter includes up to ${STARTER_LEARNER_LIMIT} learners. Pro removes the limit and adds learner progress reports.`
              : "Full-length tests and deep insights from ₹2,499/mo on Pro."}
          </p>
          <Link
            to="/premium"
            className="mt-3 inline-flex rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-bold text-accent-brand-foreground"
          >
            See plans
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-brand-soft p-4 text-sm font-semibold text-accent-foreground">
          Pro active (demo)
        </div>
      )}
      <Link to="/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent">
        <span className="grid size-9 place-items-center rounded-full bg-brand-soft font-bold text-accent-foreground">
          {p.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{p.name}</span>
          <span className="block truncate text-xs text-muted-foreground">Active learner · {p.exam}</span>
        </span>
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [path]);
  const s = usePrep();
  const learner = profileOrDemo(s.profile);
  const learnerView = ["/plan", "/practice", "/insights", "/profile"].includes(path);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r bg-sidebar p-5 lg:flex">
        <div className="space-y-8">
          <Logo />
          <NavList />
        </div>
        <SidebarFooter />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-xl border bg-card"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-sidebar p-5 shadow-card animate-in slide-in-from-left">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-9 place-items-center rounded-lg hover:bg-sidebar-accent"
                >
                  <X className="size-5" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        {!s.profile && (
          <div className="border-b bg-warn-soft px-4 py-2 text-center text-xs font-medium text-foreground sm:text-sm">
            You're viewing demo data.{" "}
            <Link to="/onboarding" className="font-bold underline underline-offset-2">
              Create a learner plan
            </Link>
          </div>
        )}
        {learnerView && <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-brand-soft px-4 py-3 text-xs sm:px-6"><span className="font-semibold">Learner view · {learner.name} · {learner.exam}</span><Link to="/dashboard" className="font-bold text-brand underline underline-offset-2">Back to coach workspace</Link></div>}
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      Demo data
    </span>
  );
}
