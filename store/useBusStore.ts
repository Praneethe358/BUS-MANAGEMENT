import { create } from "zustand";
import type { Bus } from "@/types/bus";
import type { Student } from "@/types/student";

type LiveLocation = {
  lat: number;
  lng: number;
};

type BusStore = {
  selectedBus: Bus | null;
  studentData: Student[] | null;
  liveLocation: LiveLocation | null;
  setSelectedBus: (bus: Bus | null) => void;
  setStudentData: (students: Student[] | null) => void;
  setLiveLocation: (location: LiveLocation | null) => void;
};

export const useBusStore = create<BusStore>((set) => ({
  selectedBus: null,
  studentData: null,
  liveLocation: null,
  setSelectedBus: (bus) => set({ selectedBus: bus }),
  setStudentData: (students) => set({ studentData: students }),
  setLiveLocation: (location) => set({ liveLocation: location }),
}));
