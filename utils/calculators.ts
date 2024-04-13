export function calculatePageRange(page: number, size: number): { start: number; end: number } {
  const start = (page - 1) * size;
  const end = start + size - 1;

  return { start, end };
}

export function calculateEuclideanDistance(coord1: [number, number], coord2: [number, number]): number {
  const [x1, y1] = coord1;
  const [x2, y2] = coord2;

  const distanceInDegrees = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const distanceInMiles = distanceInDegrees * 69;
  return distanceInMiles;
}

export function calculateTimeElapsed(dateString: string): string {
  const dayjs = useDayjs();

  const inputDate = dayjs(dateString);

  const now = dayjs().tz('America/New_York');
  const diff = now.diff(inputDate, 'milliseconds');

  const millisecondsElapsed = dayjs.duration(diff);

  const days = millisecondsElapsed.days();
  const hours = millisecondsElapsed.hours();
  const minutes = millisecondsElapsed.minutes();
  const seconds = millisecondsElapsed.seconds();

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return days > 0
    ? `+${days} day(s) ${paddedHours}:${paddedMinutes}:${paddedSeconds}`
    : `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}
