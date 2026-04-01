"use client";

import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { getStudents } from "@/services/databaseService";
import { useBusStore } from "@/store/useBusStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, Users, MapPin, Bus } from "lucide-react";

export default function StudentsPage() {
  const studentData = useBusStore((state) => state.studentData);
  const setStudentData = useBusStore((state) => state.setStudentData);
  const [status, setStatus] = useState("Loading students...");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    if (!studentData) return [];
    return studentData.filter(
       (student) => 
         student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
         student.busId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentData, searchQuery]);

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
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <PageHeader title="Students Directory" description="Manage and view all registered students and their stops">
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search..."
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </PageHeader>

          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-white border-b border-zinc-100 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {filteredStudents.length} Students {searchQuery && "Found"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {status.includes("Loading") ? (
                 <div className="py-16 flex flex-col items-center justify-center gap-4 text-zinc-500">
                    <Loader className="w-8 h-8" />
                    <p className="text-sm">{status}</p>
                 </div>
              ) : filteredStudents.length === 0 ? (
                 <div className="py-16 text-center text-zinc-500 flex flex-col items-center gap-2">
                    <Users className="w-10 h-10 text-zinc-300" />
                    <p className="text-sm">{searchQuery ? "No students matching your search." : status || "No students found."}</p>
                 </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-700">
                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 font-medium">Student</th>
                        <th className="px-6 py-4 font-medium">Email</th>
                        <th className="px-6 py-4 font-medium">Assigned Bus</th>
                        <th className="px-6 py-4 font-medium text-right">Stop Coordinates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-900">
                             {student.name || <span className="text-zinc-400 italic">Not set</span>}
                          </td>
                          <td className="px-6 py-4 text-zinc-500">{student.email}</td>
                          <td className="px-6 py-4">
                            {student.busId ? (
                              <Badge variant="outline" className="font-mono">
                                <Bus className="w-3 h-3 mr-1 inline" />
                                {student.busId}
                              </Badge>
                            ) : (
                              <span className="text-zinc-400 text-xs">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {student.stopLat !== null && student.stopLng !== null ? (
                               <div className="inline-flex items-center gap-1.5 text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600">
                                  <MapPin className="w-3 h-3" />
                                  {student.stopLat.toFixed(3)}, {student.stopLng.toFixed(3)}
                               </div>
                            ) : (
                               <span className="text-zinc-400 italic text-xs">Not set</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </AuthGuard>
      </main>
    </div>
  );
}
