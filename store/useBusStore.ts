import { create } from "zustand";
import type { Bus } from "@/types/bus";
import type { BusLocation } from "@/types/location";
import type { Student } from "@/types/student";

type BusStore = {
  selectedBus: Bus | null;
  studentData: Student[] | null;
  liveBusLocation: BusLocation | null;
  notificationStatus: string;
  setSelectedBus: (bus: Bus | null) => void;
  setStudentData: (students: Student[] | null) => void;
  setLiveBusLocation: (location: BusLocation | null) => void;
  setNotificationStatus: (status: string) => void;
};

export const useBusStore = create<BusStore>((set) => ({
  selectedBus: null,
  studentData: null,
  liveBusLocation: null,
  notificationStatus: "idle",
  setSelectedBus: (bus) => set({ selectedBus: bus }),
  setStudentData: (students) => set({ studentData: students }),
  setLiveBusLocation: (location) => set({ liveBusLocation: location }),
  setNotificationStatus: (status) => set({ notificationStatus: status }),
}));
