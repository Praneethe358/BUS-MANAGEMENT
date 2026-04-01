"use client";

import dynamic from "next/dynamic";

type MapViewProps = {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markerLabel?: string;
  customPopup?: React.ReactNode;
};

function MapFallback() {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
      Map unavailable (Phase 1 fallback)
    </div>
  );
}

const LeafletMapClient = dynamic<MapViewProps>(
  () => import("@/components/LeafletMapClient"),
  {
    ssr: false,
    loading: () => <MapFallback />,
  },
);

export default function MapView(props: MapViewProps) {
  return <LeafletMapClient {...props} />;
}

export type { MapViewProps };
