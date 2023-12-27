import { z } from 'zod';

import { LocationSchema } from '~/models/location';

export const TimecardSchema = z.object({
  id: z.string(),
  location: LocationSchema,
  startedAt: z.number(),
  endedAt: z.number(),
  clientId: z.string(),
  employeeId: z.string(),
});
export type Timecard = z.infer<typeof TimecardSchema>;
