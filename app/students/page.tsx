"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { getStudents } from "@/services/databaseService";
import { useBusStore } from "@/store/useBusStore";

export default function StudentsPage() {
  const studentData = useBusStore((state) => state.studentData);
  const setStudentData = useBusStore((state) => state.setStudentData);
  const [status, setStatus] = useState("Loading students...");

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      try {
        const students = await getStudents();

        if (!isMounted) {
          return;
        }

        setStudentData(students);
        setStatus(students.length === 0 ? "No students found." : "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStudentData([]);
        setStatus(error instanceof Error ? error.message : "Unable to load students.");
      }
    };

    void loadStudents();

    return () => {
      isMounted = false;
    };
  }, [setStudentData]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="mt-2 text-zinc-600">
            Student list from Supabase, synced into Zustand store.
          </p>
          {status && <p className="mt-3 text-sm text-zinc-700">{status}</p>}
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
