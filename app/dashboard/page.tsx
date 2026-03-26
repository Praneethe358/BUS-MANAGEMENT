"use client";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Foundation view for student and coordinator dashboards.
          </p>
        </AuthGuard>
      </main>
    </div>
  );
}
