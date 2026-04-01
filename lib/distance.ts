const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function haversineDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const latDelta = toRadians(toLat - fromLat);
  const lngDelta = toRadians(toLng - fromLng);

  const fromLatRadians = toRadians(fromLat);
  const toLatRadians = toRadians(toLat);

  const haversineA =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLatRadians) * Math.cos(toLatRadians) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  return EARTH_RADIUS_METERS * haversineC;
}