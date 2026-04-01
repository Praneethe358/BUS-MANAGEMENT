import type { Bus } from "@/types/bus";
import type { Student } from "@/types/student";
import { getSupabaseClient } from "@/lib/supabase";

type StudentRow = {
  id: string;
  name: string;
  email: string;
  bus_id: string | null;
  stop_lat: number | null;
  stop_lng: number | null;
};

type BusRow = {
  id: string;
  name?: string | null;
  route?: string | null;
  driver_name?: string | null;
};

type BusLocationRow = {
  latitude: number;
  longitude: number;
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
      stopLat: student.stop_lat,
      stopLng: student.stop_lng,
    }));
  } catch (error) {
    throw normalizeDataError(error, "Unable to fetch students.");
  }
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      console.log("[dashboard] student fetch result:", null);
      return null;
    }

    const student = data as StudentRow;
    console.log("[dashboard] student fetch result:", student);

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      busId: student.bus_id ?? "",
      stopLat: student.stop_lat,
      stopLng: student.stop_lng,
    };
  } catch (error) {
    throw normalizeDataError(error, "Unable to fetch student profile.");
  }
}

export async function createStudentProfileIfMissing(email: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = email.trim().toLowerCase();
    const defaultName = normalizedEmail.split("@")[0] || "Student";

    const { data: existingStudent, error: readError } = await supabase
      .from("students")
      .select("id")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (readError) {
      throw readError;
    }

    if (existingStudent) {
      return;
    }

    const { error } = await supabase.from("students").insert({
      email: normalizedEmail,
      name: defaultName,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw normalizeDataError(error, "Unable to create student profile.");
  }
}

export async function assignDefaultBusToStudentIfMissing(email: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, bus_id, stop_lat, stop_lng")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (studentError) {
      throw studentError;
    }

    if (!studentData) {
      return;
    }

    if (studentData.bus_id && studentData.stop_lat !== null && studentData.stop_lng !== null) {
      return;
    }

    const { data: busData, error: busError } = await supabase
      .from("buses")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (busError) {
      throw busError;
    }

    if (!busData?.id) {
      return;
    }

    const { data: latestLocationData } = await supabase
      .from("bus_locations")
      .select("latitude, longitude")
      .eq("bus_id", busData.id)
      .limit(1)
      .maybeSingle();

    const latestLocation = (latestLocationData ?? null) as BusLocationRow | null;
    const stopLat = studentData.stop_lat ?? latestLocation?.latitude ?? 11.0183;
    const stopLng = studentData.stop_lng ?? latestLocation?.longitude ?? 76.9558;

    const { error: updateError } = await supabase
      .from("students")
      .update({
        bus_id: studentData.bus_id ?? busData.id,
        stop_lat: stopLat,
        stop_lng: stopLng,
      })
      .eq("id", studentData.id);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    throw normalizeDataError(error, "Unable to assign a default bus.");
  }
}

export async function getBuses(): Promise<Bus[]> {
  try {
    const supabase = getSupabaseClient();
    let data: BusRow[] | null = null;
    let error: Error | null = null;

    const primaryQuery = await supabase.from("buses").select("id, name");
    data = (primaryQuery.data ?? null) as BusRow[] | null;
    error = primaryQuery.error;

    if (error) {
      const fallback = await supabase.from("buses").select("id, route, driver_name");
      data = (fallback.data ?? null) as BusRow[] | null;
      error = fallback.error;
    }

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as BusRow[];
    const buses = rows.map((bus) => ({
      id: bus.id,
      name: bus.name ?? bus.route ?? "Unnamed Bus",
      route: bus.route ?? undefined,
      driverName: bus.driver_name ?? undefined,
    }));

    console.log("[bus] bus list result:", buses);
    return buses;
  } catch (error) {
    throw normalizeDataError(error, "Unable to fetch buses.");
  }
}