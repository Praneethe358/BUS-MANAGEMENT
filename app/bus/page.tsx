"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import MapView from "@/components/MapView";
import Navbar from "@/components/Navbar";
import { useDriverLocationTracking } from "@/hooks/useDriverLocationTracking";
import { getBuses } from "@/services/databaseService";
import { getLatestBusLocation } from "@/services/realtimeService";
import { useBusStore } from "@/store/useBusStore";
import type { Bus } from "@/types/bus";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { PageHeader } from "@/components/ui/PageHeader";
import { Activity, Bus as BusIcon, Clock, Map, MapPin } from "lucide-react";

export default function BusPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [status, setStatus] = useState("Loading buses...");

  const selectedBus = useBusStore((state) => state.selectedBus);
  const liveBusLocation = useBusStore((state) => state.liveBusLocation);
  const setSelectedBus = useBusStore((state) => state.setSelectedBus);
  const setLiveBusLocation = useBusStore((state) => state.setLiveBusLocation);

  const { trackingError, lastSyncAt } = useDriverLocationTracking({
    busId: selectedBus?.id ?? null,
    enabled: isTrackingEnabled,
    intervalMs: 7000,
    onLocation: ({ latitude, longitude }) => {
      if (!selectedBus) {
        return;
      }

      setLiveBusLocation({
        id: `local-${selectedBus.id}`,
        busId: selectedBus.id,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      });
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadBuses = async () => {
      try {
        const fetchedBuses = await getBuses();

        if (!isMounted) {
          return;
        }

        setBuses(fetchedBuses);
        const firstBus = fetchedBuses[0] ?? null;

        setSelectedBus(firstBus);
        setSelectedBusId(firstBus?.id ?? "");
        setStatus(firstBus ? "" : "No buses available");
      } catch {
        if (isMounted) {
          setSelectedBus(null);
          setStatus("No buses found");
        }
      }
    };

    void loadBuses();

    return () => {
      isMounted = false;
    };
  }, [setSelectedBus]);

  useEffect(() => {
    const nextSelectedBus = buses.find((bus) => bus.id === selectedBusId) ?? null;
    setSelectedBus(nextSelectedBus);
  }, [buses, selectedBusId, setSelectedBus]);

  useEffect(() => {
    if (!selectedBus) {
      setLiveBusLocation(null);
      return;
    }

    let isMounted = true;

    const loadLatestLocation = async () => {
      try {
        const latestLocation = await getLatestBusLocation(selectedBus.id);
        if (!isMounted) {
          return;
        }

        setLiveBusLocation(latestLocation);
      } catch {
        if (isMounted) {
          setLiveBusLocation(null);
        }
      }
    };

    void loadLatestLocation();

    return () => {
      isMounted = false;
    };
  }, [selectedBus, setLiveBusLocation]);

  const mapCenter = useMemo(() => {
    if (!liveBusLocation) {
      return undefined;
    }

    return {
      lat: liveBusLocation.latitude,
      lng: liveBusLocation.longitude,
    };
  }, [liveBusLocation]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <PageHeader title="Bus Driver Panel" description="Manage and broadcast live location">
            <Badge variant={isTrackingEnabled ? "success" : "destructive"} className="px-3 py-1.5 text-sm">
              <Activity className="w-3.5 h-3.5 mr-2" />
              {isTrackingEnabled ? "Live tracking active" : "Not tracking"}
            </Badge>
          </PageHeader>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Control Panel */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <Card>
                <CardHeader className="pb-4 border-b border-zinc-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                       <BusIcon className="h-5 w-5 text-blue-600" />
                       Bus Control
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5 shadow-none">
                  {buses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-4 text-zinc-500 gap-3">
                       <Loader />
                       <span className="text-sm">{status || "Loading buses..."}</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Select Bus</label>
                        <select
                          value={selectedBusId}
                          onChange={(event) => setSelectedBusId(event.target.value)}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:opacity-50"
                          disabled={buses.length === 0 || isTrackingEnabled}
                        >
                          {buses.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                              {bus.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2">
                        <Button 
                          onClick={() => setIsTrackingEnabled((previous) => !previous)}
                          disabled={!selectedBus}
                          variant={isTrackingEnabled ? "destructive" : "default"}
                          className="w-full h-11 text-base shadow-md"
                        >
                          {isTrackingEnabled ? "Stop Broadcasting" : "Start Live Tracking"}
                        </Button>
                      </div>
                    </>
                  )}

                  {trackingError && (
                     <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
                       {trackingError}
                     </div>
                  )}
                  {status && buses.length > 0 && !status.includes("Loading") && (
                     <p className="text-sm text-zinc-500">{status}</p>
                  )}

                </CardContent>
              </Card>

              {/* Status Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Last sync</span>
                    <span className="font-medium text-zinc-900">{lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : "Never"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location</span>
                    <span className="font-medium text-zinc-900">
                       {liveBusLocation ? `${liveBusLocation.latitude.toFixed(4)}, ${liveBusLocation.longitude.toFixed(4)}` : "Unavailable"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Section */}
            <Card className="md:col-span-2 overflow-hidden flex flex-col min-h-[500px]">
              <CardHeader className="pb-3 border-b border-zinc-100 bg-white">
                 <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <Map className="w-4 h-4 text-blue-600" />
                    Live Route Map
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative bg-zinc-100">
                <MapView
                  center={mapCenter}
                  markerLabel={selectedBus ? `${selectedBus.name}` : "Bus"}
                  customPopup={
                    selectedBus ? (
                      <div className="p-1 text-center min-w-[100px]">
                        <div className="font-bold border-b border-zinc-100 pb-1 mb-1">{selectedBus.name}</div>
                        <div className="text-xs text-zinc-600 flex items-center gap-1 justify-center mt-1">
                          <span className={`w-2 h-2 rounded-full ${isTrackingEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          {isTrackingEnabled ? "Tracking live" : "Offline"}
                        </div>
                      </div>
                    ) : undefined
                  }
                />
              </CardContent>
            </Card>
          </div>
        </AuthGuard>
      </main>
    </div>
  );
}
