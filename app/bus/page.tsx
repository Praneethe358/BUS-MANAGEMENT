"use client";

import { useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import MapView from "@/components/MapView";
import Navbar from "@/components/Navbar";
import { getBuses } from "@/services/databaseService";
import { useBusStore } from "@/store/useBusStore";

export default function BusPage() {
  const setSelectedBus = useBusStore((state) => state.setSelectedBus);

  useEffect(() => {
    let isMounted = true;

    const loadBuses = async () => {
      try {
        const buses = await getBuses();

        if (!isMounted) {
          return;
        }

        setSelectedBus(buses[0] ?? null);
      } catch {
        if (isMounted) {
          setSelectedBus(null);
        }
      }
    };

    void loadBuses();

    return () => {
      isMounted = false;
    };
  }, [setSelectedBus]);

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
