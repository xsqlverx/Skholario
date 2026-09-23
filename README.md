# Study Hub — Pass 1

A personal, local-first B.Tech study space. No account or backend setup.

## Run

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 --port 3100
```

Open http://127.0.0.1:3100. Port 3000 was blocked by Windows in the implementation environment. For production: `npm run build`, then `npm start -- --port 3100`.

## Routes

- `/`: Today and the next uncompleted topic.
- `/subjects`: six subjects in an asymmetric editorial collection.
- `/subjects/[slug]`: curriculum map with complete/current/unstarted states and resource placeholder.
- `/study/[slug]?topic=[topic-id]`: focused session shell; Start, Mark complete, and Next topic.
- `/manifest.webmanifest`: PWA metadata.
- Unknown subjects/topics show the custom not-found screen.

Subject slugs: `mathematics`, `physics`, `mechanics`, `programming`, `graphics`, `electrical`.

## Files created / modified

Modified: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `README.md`.

Created:

- `app/subjects/page.tsx`, `app/subjects/[slug]/page.tsx`, `app/study/[slug]/page.tsx`
- `app/not-found.tsx`, `app/manifest.ts`
- `components/study/Shell.tsx`: navigation, skip link, footer, progress provider
- `components/study/Primitives.tsx`: Eyebrow, ActionLink, SectionTitle, ProgressMarks
- `components/study/Today.tsx`, `SubjectCollection.tsx`, `SubjectDetail.tsx`, `StudySession.tsx`
- `components/study/StudyState.tsx`: small local-storage adapter
- `lib/curriculum.ts`: typed course/unit/topic data and sample completions
- `public/icon.svg`, `public/icon-192.png`, `public/icon-512.png`

The previous prototype components, store, and utilities remain intact but are not imported by the active routes. Existing package/lockfile changes predated this pass; no application dependencies were added.

## Design system

Tokens live at the top of `app/globals.css`. Warm paper (#f5f3eb), charcoal ink (#24251f), vermilion (#ee482f), supporting pale yellow and green. System sans-serif, editorial Georgia italic, monospace metadata; no remote font requests. Square surfaces, rules, mixed scales, limited paper-like rotation, and quiet supporting information keep the main study action dominant.

Mobile is a single reading column; tablet switches to two-column subject posters; desktop uses an asymmetric composition. Minimum 44px control heights, explicit focus rings, a skip link, semantic headings, text statuses, and reduced-motion rules are included. Lucide is the consistent icon system.

## Data and boundaries

The user did not specify branch, semester, or curriculum scheme. The UI labels its six-course selection as sample KTU curriculum, drawn from first-year 2019 course names. It is not an authoritative six-subject semester. Topic maps and estimates are illustrative, and the sample exam date is explicitly labelled. Confirm the student's exact syllabus before replacing this data.

Course-name reference: https://www.ajce.in/ce/downloads/KTU_2019_-_First_Years_Syllabus.pdf

No uploaded notes exist. Resource links lead to the appropriate subject's honest empty resource section.

The focus page is a shell for studying from the student's own notes, not a content reader or timer. Its small completion interaction demonstrates the core loop. Today selects the first incomplete topic in curriculum order; this is a deterministic rule, not AI or deadline-aware scheduling.

The existing prototype already had local persistence. New progress uses the separate `study-hub.progress.v1` key and `{ version: 1, completed: string[] }`, validates saved IDs, tolerates malformed data, and falls back to in-memory progress when storage fails. It does not migrate or overwrite the old prototype's `studysync_*` keys. `useSyncExternalStore` avoids hydration mismatches and listens for cross-tab storage changes. Initial completions are demo data. Topic IDs must remain stable when replacing sample content; introduce an explicit data migration if their meaning changes.

Next.js App Router and TypeScript remain in place. Route modules handle parameter validation; client components handle the small amount of interactivity. No custom API endpoints or database were added. The study route uses awaited Next.js 16 params/searchParams.

PWA foundation includes a manifest, theme metadata, 192px icon, and 512px maskable icon. Offline caching, a service worker, update lifecycle, and installation testing are deferred. This is not yet a fully offline PWA.

Intentionally absent: authentication, profiles, payments, subscriptions, PDF parsing/upload, AI recommendations, cloud sync, analytics, advanced scheduling, exam editing, and backend infrastructure.

## Validation

- Production build and TypeScript compilation pass.
- Targeted lint: `npx eslint app components/study lib/curriculum.ts`.
- Full-repository lint includes pre-existing legacy warnings and a `react-hooks/set-state-in-effect` error in `lib/store.tsx`; that unused store is unchanged.
- Browser checks cover desktop/mobile layout, subject navigation, focus start/completion/next-topic flow, and completion persistence after reload.

Stop here for Pass 1. The next pass should confirm the actual curriculum and resource workflow before adding features.
