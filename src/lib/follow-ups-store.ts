// Shared follow-up store: useSyncExternalStore + localStorage so the
// follow-ups page and the coach dashboard always show the same counts.
// Pattern mirrors prep-store.ts (the existing shared store).
import { useSyncExternalStore } from "react";
import { sampleFollowUps, summarizeFollowUps, type FollowUp } from "@/lib/coach-follow-ups";

const KEY = "preppilot-followups-v1";

let store: FollowUp[] | null = null;
const listeners = new Set<() => void>();

function load(): FollowUp[] {
  if (store !== null) return store;
  if (typeof window === "undefined") return sampleFollowUps();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        store = parsed as FollowUp[];
        return store;
      }
    }
  } catch {
    /* ignore */
  }
  store = sampleFollowUps();
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
  return store;
}

function save(next: FollowUp[]) {
  store = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): FollowUp[] {
  return load();
}

/** React hook: returns the current follow-up list (re-renders on changes). */
export function useFollowUps(): FollowUp[] {
  return useSyncExternalStore(subscribe, getSnapshot, sampleFollowUps);
}

/** Toggle a follow-up between done=true and done=false. */
export function toggleFollowUp(id: string) {
  const next = load().map((f) => (f.id === id ? { ...f, done: !f.done } : f));
  save(next);
}

/** Append a new follow-up to the list. */
export function appendFollowUp(item: FollowUp) {
  const next = [...load(), item];
  save(next);
}

/** Derived summary (pending / overdue / done counts). */
export function useFollowUpSummary() {
  const followUps = useFollowUps();
  return summarizeFollowUps(followUps);
}
