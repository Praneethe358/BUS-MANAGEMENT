"use client";

import AuthGuard from "@/components/AuthGuard";
import MapView from "@/components/MapView";
import Navbar from "@/components/Navbar";

export default function BusPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <h1 className="text-2xl font-semibold">Bus</h1>
          <p className="mt-2 text-zinc-600">Basic map scaffold for bus tracking.</p>
          <div className="mt-4">
            <MapView />
          </div>
        </AuthGuard>
      </main>
    </div>
  );
}
