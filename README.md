# Karunya Bus Tracking App – Phase 1

Phase 1 provides the project foundation and scaffolding for a scalable bus tracking app.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Firebase (Authentication + Firestore)
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
- Firebase initialization in `lib/firebase.ts` (env-based)
- Basic email/password auth service
- Firestore collection references (`students`, `buses`)
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
	firebase.ts
services/
	authService.ts
	firestoreService.ts
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
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Without Firebase/Maps keys, pages still render safely with fallback messages.

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
- Advanced Firestore queries
- Production-grade UI refinements
