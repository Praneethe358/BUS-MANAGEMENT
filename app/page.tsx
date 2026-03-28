import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Karunya Bus Tracking App</h1>
        <p className="mt-2 text-zinc-600">
          Phase 1 foundation is set up with page scaffolding, Supabase,
          Zustand, and Google Maps integration.
        </p>
      </main>
    </div>
  );
}
