# Nexora

Nexora is a responsive, dark-first productivity dashboard built with the Next.js App Router, TypeScript, Tailwind CSS, Lucide, Recharts, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` to validate the app.

## Workspace features

- Overview with task metrics, productivity charts, activity, deadlines, and attention items
- Searchable, filterable Kanban and list task views with create, edit, delete, status changes, and drag and drop
- Editable project cards with progress and team details
- Month and week calendar views with task deadlines and creatable events
- Analytics charts and profile, appearance, and notification settings
- Local browser persistence for tasks, projects, events, settings, and theme

The app is frontend-only. Workspace data is stored in the browser's `localStorage`; no account or server-side sync is configured.
