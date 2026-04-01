"use client";

import { useEffect, useRef, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import MapView from "@/components/MapView";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Activity, BellRing, Bus, Map, MapPin, User, AlertCircle } from "lucide-react";
import { haversineDistanceMeters } from "@/lib/distance";
import { getSupabaseClient } from "@/lib/supabase";
import {
  assignDefaultBusToStudentIfMissing,
  createStudentProfileIfMissing,
  getStudentByEmail,
} from "@/services/databaseService";
import {
  initializeBrowserNotifications,
  sendBusNearStopNotification,
  subscribeToForegroundNotifications,
} from "@/services/notificationService";
import { getLatestBusLocation, subscribeToBusLocations } from "@/services/realtimeService";
import { useBusStore } from "@/store/useBusStore";
import type { Student } from "@/types/student";

export default function DashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [distanceToStop, setDistanceToStop] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  const nearStopTriggeredRef = useRef(false);

  const liveBusLocation = useBusStore((state) => state.liveBusLocation);
  const notificationStatus = useBusStore((state) => state.notificationStatus);
  const setLiveBusLocation = useBusStore((state) => state.setLiveBusLocation);
  const setNotificationStatus = useBusStore((state) => state.setNotificationStatus);

  useEffect(() => {
    let isMounted = true;
    let removeRealtimeSubscription: (() => void) | null = null;
    let removeForegroundSubscription: (() => void) | null = null;

    const setupDashboard = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        let email = user?.email;
        if (!email) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          email = session?.user.email;
        }

        console.log("[dashboard] user email:", email ?? null);

        if (!email) {
          throw new Error("No logged-in student email found.");
        }

        let studentProfile = await getStudentByEmail(email);
        if (!studentProfile) {
          await createStudentProfileIfMissing(email);
          studentProfile = await getStudentByEmail(email);
        }

        if (!studentProfile) {
          setError("Student profile could not be created. Please contact support.");
          return;
        }

        if (!studentProfile.busId) {
          await assignDefaultBusToStudentIfMissing(email);
          studentProfile = await getStudentByEmail(email);
        }

        if (!isMounted) {
          return;
        }

        setStudent(studentProfile);

        if (!studentProfile?.busId) {
          setError("Student profile found, but no bus is assigned yet.");
          return;
        }

        const latestBusLocation = await getLatestBusLocation(studentProfile.busId);
        if (isMounted) {
          setLiveBusLocation(latestBusLocation);
        }

        removeRealtimeSubscription = subscribeToBusLocations(studentProfile.busId, (location) => {
          setLiveBusLocation(location);
        });

        const token = await initializeBrowserNotifications();
        if (isMounted) {
          setDeviceToken(token);
          setNotificationStatus(token ? "ready" : "permission-denied");
        }

        removeForegroundSubscription = await subscribeToForegroundNotifications(() => {
          setNotificationStatus("received");
        });
      } catch (setupError) {
        if (!isMounted) {
          return;
        }

        const rawMessage = setupError instanceof Error ? setupError.message : "Unable to initialize dashboard.";
        const message = rawMessage.includes("No logged-in student email found")
          ? "Please login again"
          : rawMessage;
        setError(message);
      }
    };

    void setupDashboard();

    return () => {
      isMounted = false;
      removeRealtimeSubscription?.();
      removeForegroundSubscription?.();
    };
  }, [setLiveBusLocation, setNotificationStatus]);

  useEffect(() => {
    if (!student || !liveBusLocation || student.stopLat === null || student.stopLng === null) {
      setDistanceToStop(null);
      return;
    }

    const distance = haversineDistanceMeters(
      liveBusLocation.latitude,
      liveBusLocation.longitude,
      student.stopLat,
      student.stopLng,
    );
    setDistanceToStop(distance);

    const notificationKey = `bus_notified_${student.busId}`;
    const alreadyNotified = typeof window !== "undefined" && localStorage.getItem(notificationKey) === "1";

    if (distance > 500 && alreadyNotified) {
      localStorage.removeItem(notificationKey);
      nearStopTriggeredRef.current = false;
      return;
    }

    if (distance >= 200 || nearStopTriggeredRef.current || alreadyNotified) {
      return;
    }

    nearStopTriggeredRef.current = true;
    localStorage.setItem(notificationKey, "1");
    setNotificationStatus("bus-near-stop-alerted");

    const message = "Your bus is arriving in 2 minutes";

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Bus Update", { body: message });
    }

    if (!deviceToken) {
      return;
    }

    void sendBusNearStopNotification(deviceToken, message).catch(() => {
      setNotificationStatus("send-failed");
    });
  }, [deviceToken, liveBusLocation, setNotificationStatus, student]);

  const distanceDisplay = (() => {
    if (!student) {
      return { raw: "...", status: "Waiting for student profile..." };
    }

    if (student.stopLat === null || student.stopLng === null) {
      return { raw: "...", status: "Stop coordinates are not set." };
    }

    if (!liveBusLocation) {
      return { raw: "...", status: "Waiting for live bus location..." };
    }

    if (distanceToStop === null) {
      return { raw: "...", status: "Calculating distance..." };
    }

    const m = Math.round(distanceToStop);
    let uxState = "Bus arriving";
    if (m > 500) uxState = "Bus is far";
    else if (m >= 200) uxState = "Bus is approaching";

    return { raw: `${m} m`, status: uxState, distance: m };
  })();

  const isTracking = !!liveBusLocation;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <AuthGuard>
          <PageHeader title="Dashboard" description="Real-time bus tracking and updates">
            {student && (
              <div className="flex flex-col gap-2">
                <Badge variant={isTracking ? "success" : "destructive"} className="py-1.5 px-3">
                  <Activity className="w-3.5 h-3.5 mr-1" />
                  {isTracking ? "Live tracking active" : "Not tracking"}
                </Badge>
                <div className="text-[10px] text-zinc-400 text-right">Status: {notificationStatus}</div>
              </div>
            )}
          </PageHeader>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="text-sm">
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs h-7" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              </div>
            </div>
          )}
          
          {distanceDisplay.status === "Bus arriving" && (
             <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4">
               <div className="flex gap-3 items-center">
                 <BellRing className="h-5 w-5 text-blue-600 animate-pulse" />
                 <div className="text-sm">
                   <p className="font-medium text-blue-800">Notification</p>
                   <p className="text-blue-700">Bus is arriving in 2 minutes</p>
                 </div>
               </div>
             </div>
          )}

          {!student ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-500 gap-4">
              <Loader className="w-8 h-8" />
              <p className="text-sm font-medium">Loading student profile...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Student Info */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-zinc-500">Student Info</CardTitle>
                  <User className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-zinc-950">{student?.name || "No name set"}</div>
                  <p className="text-sm text-zinc-500 truncate">{student?.email}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Assigned Bus</span>
                    <Badge variant="outline" className="font-mono text-xs">{student?.busId || "None"}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Bus Status */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-zinc-500">Bus Status</CardTitle>
                  <Bus className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-zinc-950">{student?.busId ? `Bus #${student.busId}` : "No Bus"}</div>
                  <p className="text-sm text-zinc-500">{isTracking ? "On the move" : "Idle"}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Last Updated</span>
                    <span className="text-xs font-medium text-zinc-700">
                      {liveBusLocation?.updatedAt ? new Date(liveBusLocation.updatedAt).toLocaleTimeString() : "Never"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Distance Info */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-zinc-500">Distance to Stop</CardTitle>
                  <MapPin className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-zinc-950 flex items-baseline gap-2">
                    {distanceDisplay.raw}
                    <span className="text-xs font-normal text-zinc-500 line-clamp-1">{distanceDisplay.status}</span>
                  </div>
                  
                  {/* Visual distance bar */}
                  <div className="mt-4 h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    {distanceDisplay.distance !== undefined && (
                      <div 
                        className={`h-full transition-all duration-1000 ease-in-out ${distanceDisplay.distance > 500 ? 'bg-zinc-400' : distanceDisplay.distance > 200 ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, Math.max(5, 100 - (distanceDisplay.distance / 10)))}%` }}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 flex justify-between">
                    <span>Far</span>
                    <span>Arriving</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Map */}
              <Card className="md:col-span-2 lg:col-span-3 overflow-hidden flex flex-col">
                <CardHeader className="pb-3 border-b border-zinc-100 bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                      <Map className="w-4 h-4 text-blue-600" />
                      Live Bus Location
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[400px] relative bg-zinc-100">
                  {liveBusLocation ? (
                    <MapView
                      center={{ lat: liveBusLocation.latitude, lng: liveBusLocation.longitude }}
                      markerLabel="Bus Location"
                      customPopup={
                         <div className="p-1 text-center">
                           <div className="font-bold mb-0.5">Bus #{student?.busId}</div>
                           <div className="text-[11px] text-zinc-500">
                             Last updated: {new Date(liveBusLocation.updatedAt).toLocaleTimeString()}
                           </div>
                         </div>
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-3">
                       <MapPin className="w-8 h-8 opacity-20" />
                       <p className="text-sm">Waiting for GPS signal...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </AuthGuard>
      </main>
    </div>
  );
}
