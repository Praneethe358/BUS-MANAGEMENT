"use client";

import { useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useBusStore } from "@/store/useBusStore";

export default function StudentsPage() {
  const studentData = useBusStore((state) => state.studentData);
  const setStudentData = useBusStore((state) => state.setStudentData);

  useEffect(() => {
    if (!studentData) {
      setStudentData([
        {
          id: "stu-1",
          name: "Sample Student",
          email: "student@karunya.edu",
          busId: "bus-1",
        },
      ]);
    }
  }, [setStudentData, studentData]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="mt-2 text-zinc-600">
            Basic student list scaffold from Zustand store.
          </p>
          <ul className="mt-4 space-y-2">
            {(studentData ?? []).map((student) => (
              <li
                key={student.id}
                className="rounded border border-zinc-200 bg-white px-3 py-2"
              >
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-zinc-600">
                  {student.email} · Bus: {student.busId}
                </p>
              </li>
            ))}
          </ul>
        </AuthGuard>
      </main>
    </div>
  );
}
