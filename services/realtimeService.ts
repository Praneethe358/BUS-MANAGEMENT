import { getSupabaseClient } from "@/lib/supabase";
import type { BusLocation } from "@/types/location";

type BusLocationRow = {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
};

function mapBusLocation(row: BusLocationRow): BusLocation {
  return {
    id: row.id,
    busId: row.bus_id,
    latitude: row.latitude,
    longitude: row.longitude,
    updatedAt: row.updated_at,
  };
}

export async function upsertBusLocation(
  busId: string,
  latitude: number,
  longitude: number,
): Promise<BusLocation> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("bus_locations")
    .upsert(
      {
        bus_id: busId,
        latitude,
        longitude,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "bus_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapBusLocation(data as BusLocationRow);
}

export async function getLatestBusLocation(busId: string): Promise<BusLocation | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("bus_locations")
    .select("*")
    .eq("bus_id", busId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return mapBusLocation(data as BusLocationRow);
}

export function subscribeToBusLocations(
  busId: string,
  onLocationChange: (location: BusLocation) => void,
): () => void {
  const supabase = getSupabaseClient();

  const channel = supabase
    .channel(`bus-location-${busId}-${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bus_locations",
        filter: `bus_id=eq.${busId}`,
      },
      (payload) => {
        const row = payload.new as Partial<BusLocationRow>;

        if (
          !row.id ||
          !row.bus_id ||
          typeof row.latitude !== "number" ||
          typeof row.longitude !== "number" ||
          !row.updated_at
        ) {
          return;
        }

        onLocationChange(
          mapBusLocation({
            id: row.id,
            bus_id: row.bus_id,
            latitude: row.latitude,
            longitude: row.longitude,
            updated_at: row.updated_at,
          }),
        );
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}