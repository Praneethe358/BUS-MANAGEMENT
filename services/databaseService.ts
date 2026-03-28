import type { Bus } from "@/types/bus";
import type { Student } from "@/types/student";
import { getSupabaseClient } from "@/lib/supabase";

type StudentRow = {
  id: string;
  name: string;
  email: string;
  bus_id: string | null;
};

type BusRow = {
  id: string;
  route: string;
  driver_name: string;
};

function normalizeDataError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return new Error(error.message);
  }

  return new Error(fallbackMessage);
}

export async function getStudents(): Promise<Student[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("students").select("*");

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as StudentRow[];
    return rows.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      busId: student.bus_id ?? "",
    }));
  } catch (error) {
    throw normalizeDataError(error, "Unable to fetch students.");
  }
}

export async function getBuses(): Promise<Bus[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("buses").select("*");

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as BusRow[];
    return rows.map((bus) => ({
      id: bus.id,
      route: bus.route,
      driverName: bus.driver_name,
    }));
  } catch (error) {
    throw normalizeDataError(error, "Unable to fetch buses.");
  }
}