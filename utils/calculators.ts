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
  const inputDate = new Date(dateString);
  const now = new Date();

  let diffInSeconds = Math.abs((now.getTime() - inputDate.getTime()) / 1000);

  const days = Math.floor(diffInSeconds / 86400);
  diffInSeconds -= days * 86400;

  const hours = Math.floor(diffInSeconds / 3600) % 24;
  diffInSeconds -= hours * 3600;
  const minutes = Math.floor(diffInSeconds / 60) % 60;
  diffInSeconds -= minutes * 60;
  const seconds = Math.floor(diffInSeconds % 60);

  const finalHours = (`00${hours}`).slice(-2);
  const finalMinutes = (`00${minutes}`).slice(-2);
  const finalSeconds = (`00${seconds}`).slice(-2);

  return days > 0 ? `+${days} day(s) ${finalHours}:${finalMinutes}:${finalSeconds}` : `${finalHours}:${finalMinutes}:${finalSeconds}`;
}
