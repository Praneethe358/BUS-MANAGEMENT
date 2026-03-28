# Karunya Bus Tracking App – Phase 1

Phase 1 provides the project foundation and scaffolding for a scalable bus tracking app.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Supabase (Auth + PostgreSQL)
- Google Maps API (`@react-google-maps/api`)

## Implemented in Phase 1

- Core folder structure for modular scaling
- Working route skeletons:
	- `/login`
	- `/register`
	- `/dashboard`
	- `/bus`
	- `/students`
- Shared navbar navigation across pages
- Supabase client initialization in `lib/supabase.ts` (env-based)
- Supabase email/password auth service
- Supabase table queries (`students`, `buses`)
- Zustand global store (`selectedBus`, `studentData`, `liveLocation`)
- Reusable Google Map component with default center

## Project Structure

```text
app/
	bus/
	dashboard/
	login/
	register/
	students/
	globals.css
	layout.tsx
	page.tsx
components/
	MapView.tsx
	Navbar.tsx
lib/
	supabase.ts
services/
	authService.ts
	databaseService.ts
store/
	useBusStore.ts
types/
	bus.ts
	student.ts
.env.example
```

## Environment Variables

Create `.env.local` using `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Without Supabase/Maps keys, app initialization fails with a clear env validation error.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation Status

- `npm run lint` passes
- `npm run build` passes
- All required routes compile and load

## Out of Scope for Phase 1

- Live tracking
- Role-based restrictions
- Advanced Supabase queries
- Production-grade UI refinements
