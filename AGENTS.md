<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- App state (profile, plan progress, practice stats, subscription tier) lives in `src/lib/prep-store.ts` (useSyncExternalStore + localStorage); this is a frontend-only prototype with no backend, so keep all simulated logic client-side.
- The dashboard is the coach workspace; opening a sample learner loads the existing shared learner profile so plan, practice and insights remain one connected journey. Other roster rows are illustrative, not separate persisted learner accounts.
- Keep subscription savings arithmetic in `src/lib/premium-plans.ts` so the comparison and badge share tested values.
- Coach pages (roster, learner details, follow-ups) live on separate un-nested `/coach/...` routes with pure sample-data helpers in `src/lib`; their interactions stay in component state so existing student pages and shared learner state remain unchanged.
